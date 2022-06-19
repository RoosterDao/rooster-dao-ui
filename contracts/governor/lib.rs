#![cfg_attr(not(feature = "std"), no_std)]


use ink_lang as ink;

#[ink::contract]
mod governor {

    use ink_prelude::string::{
        String,
        ToString,
    };
    use ink_storage::{
        traits::{PackedLayout, SpreadAllocate, SpreadLayout, StorageLayout},
        Mapping,
    };

    use scale::{
        Decode,
        Encode,
    };


    #[derive(Default, Debug, scale::Encode, scale::Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    // proposal: String just for test purposes added
    pub struct ProposalCore {
        proposal: String,
        executed: bool,
        canceled: bool,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum MockError {
        NotOwner,
        NotApproved,
        NotAllowed,
    }


    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    #[derive(Default, SpreadAllocate)]
    pub struct Governor {
        proposals: Mapping<AccountId, ProposalCore>,
    }

    impl Governor {
        #[ink(constructor)]
        pub fn new() -> Self {
            // This call is required in order to correctly initialize the
            // `Mapping`s of our contract.
            ink_lang::utils::initialize_contract(|_| {})
        }

        /// Adds a new proposal
        #[ink(message)]
        pub fn propose(&mut self, proposal_text: String) {
            let caller = Self::env().caller();
            // TODO (among many others): check if proposal exists
            // OpenZeppelin: require(proposal.voteStart.isUnset(), "Governor: proposal already exists");
            self.proposals.insert(
                &caller,
                &ProposalCore {
                    proposal: proposal_text,
                    executed: false,
                    canceled: false,
                },
            );
        }
        /// Gets proposal of caller
        #[ink(message)]
        pub fn get_own_proposal(&self) -> ProposalCore {
            let caller = Self::env().caller();
            self.proposals.get(&caller).unwrap_or_default()
        }

        /// Governor read functions
        #[ink(message)]
        pub fn get_votes(&self, account: AccountId, blocknumber: BlockNumber) -> u32 {
            ink_env::debug_println!("getVotes: account={:?} blocknumber={:?}", account, blocknumber);
            0
        }

        #[ink(message)]
        pub fn has_voted(&self, proposal_id: u128, account: AccountId) -> bool {
            ink_env::debug_println!("has_voted: proposal_id={}, account={:?}",proposal_id, account);
            false
        }

        #[ink(message)]
        pub fn name(&self) -> String {
            ink_env::debug_println!("name");
            "Governer".to_string()
        }

        #[ink(message)]
        pub fn proposal_deadline(&self, proposal_id: u128) -> BlockNumber {
            ink_env::debug_println!("proposal_deadline: proposal_id={}", proposal_id);
            ink_env::block_number::<ink_env::DefaultEnvironment>()
        }

        #[ink(message)]        
        pub fn proposal_snapshot(&self, proposal_id: u128) -> BlockNumber {
            ink_env::debug_println!("proposal_snapshot: proposal_id={}", proposal_id);
            ink_env::block_number::<ink_env::DefaultEnvironment>()
        }

        #[ink(message)]
        pub fn proposal_votes(&self, proposal_id: u128) -> u32 {
            ink_env::debug_println!("proposal_votes: proposal_id={}", proposal_id);
            0
        }

        #[ink(message)]
        pub fn state(&self, proposal_id: u128) -> bool {
            ink_env::debug_println!("state: proposal_id={}", proposal_id);
            false
        }

        #[ink(message)]
        pub fn voting_delay(&self) -> u32 {
            ink_env::debug_println!("voting_delay");
            0
        }

        #[ink(message)]
        pub fn voting_period(&self) -> u32 {
            ink_env::debug_println!("voting_period");
            0
        }

        /// Governor write functions
        #[ink(message)]
        pub fn cast_vote(&self, proposal_id: u128) -> Result<(),MockError> {
            ink_env::debug_println!("cast_vote: proposal_id={}", proposal_id);
            Ok(())
        }

        #[ink(message)]
        pub fn execute(&self, proposal_id: u128) -> Result<(), MockError> {
            ink_env::debug_println!("execute: proposal_id={}", proposal_id);
            Ok(())
        }

        #[ink(message)]
        pub fn new_propose(&self, proposal_id: u128) -> Result<(), MockError> {
            ink_env::debug_println!("propose: proposal_id={}", proposal_id);
            Ok(())
        }


    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_lang as ink;

        #[ink::test]
        fn default_works() {
            let governor = Governor::new();
            assert_eq!(governor.get_own_proposal().proposal, "");
        }

        #[ink::test]
        fn proposal_works() {
            let mut governor = Governor::new();
            let prop_msg = "hello world!";
            governor.propose(prop_msg.to_string());
            assert_eq!(governor.get_own_proposal().proposal,prop_msg);
        }

        #[ink::test]
        fn get_votes_works() {
            let governor = Governor::new();
            let block_number = ink_env::block_number::<ink_env::DefaultEnvironment>();
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            assert_eq!(governor.get_votes(accounts.alice, block_number),0);
        }

        #[ink::test]
        fn has_voted_works() {
            let governor = Governor::new();
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            assert_eq!(governor.has_voted(0, accounts.alice), false);
        }

        #[ink::test]
        fn name_works() {
            let governor = Governor::new();
            assert_eq!(governor.name(), "Governer");
        }

        #[ink::test]
        fn proposal_deadline_works() {
            let governor = Governor::new();
            assert_eq!(governor.proposal_deadline(0),ink_env::block_number::<ink_env::DefaultEnvironment>());
        }

        #[ink::test]
        fn proposal_snapshot_works() {
            let governor = Governor::new();
            assert_eq!(governor.proposal_snapshot(0),ink_env::block_number::<ink_env::DefaultEnvironment>());
        }

        #[ink::test]
        fn proposal_votes_works() {
            let governor = Governor::new();
            assert_eq!(governor.proposal_votes(0), 0);
        }

        #[ink::test]
        fn state_works() {
            let governor = Governor::new();
            assert_eq!(governor.state(0), false);
        }

        #[ink::test]
        fn voting_delay_works() {
            let governor = Governor::new();
            assert_eq!(governor.voting_delay(),0);
        }

        #[ink::test]
        fn voting_period_works() {
            let governor = Governor::new();
            assert_eq!(governor.voting_period(),0);
        }

        #[ink::test]
        fn cast_vote_works() {
            let governor = Governor::new();
            assert!(governor.cast_vote(0).is_ok())
        }

        #[ink::test]
        fn execute_works() {
            let governor = Governor::new();
            assert!(governor.execute(0).is_ok())
        }

        #[ink::test]
        fn new_propose_works() {
            let governor = Governor::new();
            assert!(governor.new_propose(0).is_ok())
        }


    }
}
