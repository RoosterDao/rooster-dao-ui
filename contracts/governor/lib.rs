#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod governor {

    use ink_prelude::string::String;
    use ink_storage::{
        traits::{PackedLayout, SpreadAllocate, SpreadLayout, StorageLayout},
        Mapping,
    };

    #[derive(Default, Debug, scale::Encode, scale::Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    // proposal: String just for test purposes added
    pub struct ProposalCore {
        proposal: String,
        executed: bool,
        canceled: bool,
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
            assert_eq!(governor.get_own_proposal().proposal,prop_msg)
        }
    }
}
