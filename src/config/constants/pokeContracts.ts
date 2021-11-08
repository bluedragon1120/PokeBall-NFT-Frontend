import TPokeBallABI from 'config/abi/test/PokeBall.json';
import TPokeNFTABI from 'config/abi/test/PokeNFT.json';
import TPokeMarketABI from 'config/abi/test/PokeMarket.json';
import TLockedStakingABI from 'config/abi/test/LockedStaking.json';

import MPokeBallABI from 'config/abi/main/PokeBall.json';
import MPokeNFTABI from 'config/abi/main/PokeNFT.json';
import MPokeMarketABI from 'config/abi/main/PokeMarket.json';
import MLockedStakingABI from 'config/abi/main/LockedStaking.json';

export const PokeBallABI  = process.env.REACT_APP_CHAIN_ID === '97' ? TPokeBallABI : MPokeBallABI;
export const PokeNFTABI  = process.env.REACT_APP_CHAIN_ID === '97' ? TPokeNFTABI : MPokeNFTABI;
export const PokeMarketABI  = process.env.REACT_APP_CHAIN_ID === '97' ? TPokeMarketABI : MPokeMarketABI;
export const LockedStakingABI  = process.env.REACT_APP_CHAIN_ID === '97' ? TLockedStakingABI : MLockedStakingABI;

export const PokeBallContractAddress = process.env.REACT_APP_CHAIN_ID === '97' ? 
    '0xF6F2667e1d9312Fc82765d7Df264A3f40cc2b141': // test
    '0xF6F2667e1d9312Fc82765d7Df264A3f40cc2b141'; // main

export const PokeNFTContractAddress = process.env.REACT_APP_CHAIN_ID === '97' ? 
'0xa3Ee40D0304A7A6913C7C0a392177251c0DAf7e0': // test
'0xa3Ee40D0304A7A6913C7C0a392177251c0DAf7e0'; // main

export const PokeMarketContractAddress = process.env.REACT_APP_CHAIN_ID === '97' ? 
'0xcbe92b832a1a5Af41648cF43bE70a87d901cbeb6': // test
'0xcbe92b832a1a5Af41648cF43bE70a87d901cbeb6'; // main

export const LockedStakingContractAddress = process.env.REACT_APP_CHAIN_ID === '97' ? 
'0x50A4fEba4AA5E3930e65F598A55475F1cbb01604': // test
'0x50A4fEba4AA5E3930e65F598A55475F1cbb01604'; // main