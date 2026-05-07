// SPDX-License-Identifier: Apache-2.0
#[test_only]
module sc_signalvault::signalvault_tests;

use sc_signalvault::signalvault;
use sui::test_scenario;

const OWNER: address = @0xA11CE;
const ADMIN: address = @0xB0B;
const STRANGER: address = @0xC0FFEE;

#[test]
fun create_and_query() {
    let mut scenario = test_scenario::begin(OWNER);
    let policy = signalvault::new_for_testing(
        b"frm_test_1",
        b"walrus_blob_schema_xyz",
        OWNER,
        scenario.ctx(),
    );
    assert!(signalvault::owner(&policy) == OWNER, 0);
    assert!(signalvault::is_active(&policy), 1);
    assert!(signalvault::response_count(&policy) == 0, 2);
    assert!(signalvault::is_authorized(&policy, OWNER), 3);
    assert!(!signalvault::is_authorized(&policy, ADMIN), 4);
    signalvault::destroy_for_testing(policy);
    scenario.end();
}

#[test]
fun owner_can_add_and_remove_admin() {
    let mut scenario = test_scenario::begin(OWNER);
    let mut policy = signalvault::new_for_testing(
        b"frm_test_2",
        b"walrus_blob_schema_xyz",
        OWNER,
        scenario.ctx(),
    );

    signalvault::add_admin(&mut policy, ADMIN, scenario.ctx());
    assert!(signalvault::is_authorized(&policy, ADMIN), 0);

    signalvault::remove_admin(&mut policy, ADMIN, scenario.ctx());
    assert!(!signalvault::is_authorized(&policy, ADMIN), 1);

    signalvault::destroy_for_testing(policy);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = ::sc_signalvault::signalvault::ENotOwner)]
fun stranger_cannot_add_admin() {
    let mut scenario = test_scenario::begin(OWNER);
    let mut policy = signalvault::new_for_testing(
        b"frm_test_3",
        b"walrus_blob_schema_xyz",
        OWNER,
        scenario.ctx(),
    );
    scenario.next_tx(STRANGER);
    signalvault::add_admin(&mut policy, ADMIN, scenario.ctx());
    signalvault::destroy_for_testing(policy);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = ::sc_signalvault::signalvault::EAdminAlreadyExists)]
fun cannot_add_same_admin_twice() {
    let mut scenario = test_scenario::begin(OWNER);
    let mut policy = signalvault::new_for_testing(
        b"frm_test_4",
        b"walrus_blob_schema_xyz",
        OWNER,
        scenario.ctx(),
    );
    signalvault::add_admin(&mut policy, ADMIN, scenario.ctx());
    signalvault::add_admin(&mut policy, ADMIN, scenario.ctx());
    signalvault::destroy_for_testing(policy);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = ::sc_signalvault::signalvault::EAdminNotFound)]
fun cannot_remove_unknown_admin() {
    let mut scenario = test_scenario::begin(OWNER);
    let mut policy = signalvault::new_for_testing(
        b"frm_test_5",
        b"walrus_blob_schema_xyz",
        OWNER,
        scenario.ctx(),
    );
    signalvault::remove_admin(&mut policy, ADMIN, scenario.ctx());
    signalvault::destroy_for_testing(policy);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = ::sc_signalvault::signalvault::ENotOwner)]
fun stranger_cannot_archive() {
    let mut scenario = test_scenario::begin(OWNER);
    let mut policy = signalvault::new_for_testing(
        b"frm_test_6",
        b"walrus_blob_schema_xyz",
        OWNER,
        scenario.ctx(),
    );
    scenario.next_tx(STRANGER);
    signalvault::archive_form(&mut policy, scenario.ctx());
    signalvault::destroy_for_testing(policy);
    scenario.end();
}
