import { gql } from '@apollo/client';

export const GET_STEALTH_META_ADDRESS_SETS = gql`
  query getStealthMetaAddressSetsRegistry {
    stealthMetaAddressSets {
      id
      registrant
      schemeId
      stealthMetaAddress
    }
  }
`