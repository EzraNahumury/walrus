// SPDX-License-Identifier: Apache-2.0
//
// SignalVault — on-chain anchor for Walrus-stored encrypted feedback forms.
//
// This module records *who owns a form* and *which wallets are authorized
// to decrypt sensitive responses for that form*. It is deliberately small.
// All form schemas, response envelopes, and media live as Walrus blobs;
// only ownership, authorization, and audit events live on Sui.
//
// Seal compatibility:
//   - The `FormPolicy` object's ID is intended to be used as the
//     access-control anchor for Seal-encrypted response payloads.
//   - Seal policies off-chain check `is_authorized(policy, addr)` to gate
//     decryption keys. The Move code itself never holds plaintext or keys.
module sc_signalvault::signalvault;

use std::string::{Self, String};
use sui::clock::Clock;
use sui::event;

// === Errors ===
const ENotOwner: u64 = 1;
const EAdminAlreadyExists: u64 = 2;
const EAdminNotFound: u64 = 3;
const EFormInactive: u64 = 4;

// === Objects ===

/// Shared object that anchors a SignalVault form on-chain.
/// Schema and responses live on Walrus; this object holds ownership,
/// the Walrus schema blob ID, and the admin allowlist used by Seal.
public struct FormPolicy has key, store {
    id: UID,
    /// Caller-supplied form UID (e.g. nanoid). Public, lowercased ASCII.
    form_uid: vector<u8>,
    /// The wallet that created this form. Has all permissions.
    owner: address,
    /// Walrus blob ID (base-encoded) of the canonical form schema.
    schema_blob_id: String,
    /// Wallets allowed to decrypt sensitive responses (besides owner).
    admins: vector<address>,
    /// Creation time in ms.
    created_at_ms: u64,
    /// Last schema update time in ms.
    updated_at_ms: u64,
    /// If false, new responses are rejected by the frontend / off-chain
    /// indexers. The object remains queryable.
    active: bool,
    /// Monotonic counter incremented by `record_response`.
    response_count: u64,
}

// === Events ===

public struct FormCreated has copy, drop {
    policy_id: ID,
    form_uid: vector<u8>,
    owner: address,
    schema_blob_id: String,
    created_at_ms: u64,
}

public struct FormUpdated has copy, drop {
    policy_id: ID,
    new_schema_blob_id: String,
    updated_at_ms: u64,
}

public struct FormArchived has copy, drop {
    policy_id: ID,
    archived_by: address,
}

public struct AdminAdded has copy, drop {
    policy_id: ID,
    admin: address,
    added_by: address,
}

public struct AdminRemoved has copy, drop {
    policy_id: ID,
    admin: address,
    removed_by: address,
}

public struct ResponseRecorded has copy, drop {
    policy_id: ID,
    response_blob_id: String,
    response_hash: vector<u8>,
    submitter: address,
    timestamp_ms: u64,
    sequence: u64,
}

// === Public entry functions ===

/// Create a new form policy. The created object is shared so anyone can
/// submit responses (the off-chain Seal layer enforces decrypt access).
public fun create_form(
    form_uid: vector<u8>,
    schema_blob_id: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let owner = ctx.sender();
    let now = clock.timestamp_ms();
    let schema = string::utf8(schema_blob_id);

    let policy = FormPolicy {
        id: object::new(ctx),
        form_uid,
        owner,
        schema_blob_id: schema,
        admins: vector::empty(),
        created_at_ms: now,
        updated_at_ms: now,
        active: true,
        response_count: 0,
    };

    event::emit(FormCreated {
        policy_id: object::id(&policy),
        form_uid: policy.form_uid,
        owner,
        schema_blob_id: policy.schema_blob_id,
        created_at_ms: now,
    });

    transfer::share_object(policy);
}

/// Replace the schema blob ID. Only owner.
public fun update_schema(
    policy: &mut FormPolicy,
    new_schema_blob_id: vector<u8>,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert_owner(policy, ctx);
    policy.schema_blob_id = string::utf8(new_schema_blob_id);
    policy.updated_at_ms = clock.timestamp_ms();

    event::emit(FormUpdated {
        policy_id: object::id(policy),
        new_schema_blob_id: policy.schema_blob_id,
        updated_at_ms: policy.updated_at_ms,
    });
}

/// Mark the form inactive. Only owner.
public fun archive_form(policy: &mut FormPolicy, ctx: &TxContext) {
    assert_owner(policy, ctx);
    policy.active = false;
    event::emit(FormArchived {
        policy_id: object::id(policy),
        archived_by: ctx.sender(),
    });
}

/// Re-activate a form. Only owner.
public fun reactivate_form(policy: &mut FormPolicy, ctx: &TxContext) {
    assert_owner(policy, ctx);
    policy.active = true;
}

/// Add an admin wallet allowed to decrypt sensitive responses.
public fun add_admin(
    policy: &mut FormPolicy,
    admin: address,
    ctx: &TxContext,
) {
    assert_owner(policy, ctx);
    assert!(!policy.admins.contains(&admin), EAdminAlreadyExists);
    policy.admins.push_back(admin);

    event::emit(AdminAdded {
        policy_id: object::id(policy),
        admin,
        added_by: ctx.sender(),
    });
}

/// Remove an admin wallet.
public fun remove_admin(
    policy: &mut FormPolicy,
    admin: address,
    ctx: &TxContext,
) {
    assert_owner(policy, ctx);
    let (found, idx) = index_of(&policy.admins, &admin);
    assert!(found, EAdminNotFound);
    policy.admins.remove(idx);

    event::emit(AdminRemoved {
        policy_id: object::id(policy),
        admin,
        removed_by: ctx.sender(),
    });
}

/// Record that a response blob was published for this form.
/// Anyone can call this; the response itself is on Walrus and (for sensitive
/// fields) Seal-encrypted to this policy. The on-chain record makes the
/// submission tamper-evident and auditable.
public fun record_response(
    policy: &mut FormPolicy,
    response_blob_id: vector<u8>,
    response_hash: vector<u8>,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(policy.active, EFormInactive);
    let seq = policy.response_count + 1;
    policy.response_count = seq;

    event::emit(ResponseRecorded {
        policy_id: object::id(policy),
        response_blob_id: string::utf8(response_blob_id),
        response_hash,
        submitter: ctx.sender(),
        timestamp_ms: clock.timestamp_ms(),
        sequence: seq,
    });
}

// === View functions ===

public fun owner(policy: &FormPolicy): address { policy.owner }
public fun is_active(policy: &FormPolicy): bool { policy.active }
public fun schema_blob_id(policy: &FormPolicy): String { policy.schema_blob_id }
public fun admins(policy: &FormPolicy): &vector<address> { &policy.admins }
public fun response_count(policy: &FormPolicy): u64 { policy.response_count }
public fun form_uid(policy: &FormPolicy): &vector<u8> { &policy.form_uid }

/// True if `addr` is the owner or an admin. Off-chain Seal access checks
/// should call this view to decide whether to release decryption keys.
public fun is_authorized(policy: &FormPolicy, addr: address): bool {
    addr == policy.owner || policy.admins.contains(&addr)
}

// === Internal helpers ===

fun assert_owner(policy: &FormPolicy, ctx: &TxContext) {
    assert!(policy.owner == ctx.sender(), ENotOwner);
}

fun index_of(v: &vector<address>, target: &address): (bool, u64) {
    let n = v.length();
    let mut i = 0;
    while (i < n) {
        if (&v[i] == target) {
            return (true, i)
        };
        i = i + 1;
    };
    (false, 0)
}

// === Test-only helpers ===

#[test_only]
public fun new_for_testing(
    form_uid: vector<u8>,
    schema_blob_id: vector<u8>,
    owner: address,
    ctx: &mut TxContext,
): FormPolicy {
    FormPolicy {
        id: object::new(ctx),
        form_uid,
        owner,
        schema_blob_id: string::utf8(schema_blob_id),
        admins: vector::empty(),
        created_at_ms: 0,
        updated_at_ms: 0,
        active: true,
        response_count: 0,
    }
}

#[test_only]
public fun destroy_for_testing(policy: FormPolicy) {
    let FormPolicy {
        id,
        form_uid: _,
        owner: _,
        schema_blob_id: _,
        admins: _,
        created_at_ms: _,
        updated_at_ms: _,
        active: _,
        response_count: _,
    } = policy;
    object::delete(id);
}
