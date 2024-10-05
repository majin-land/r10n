import { gql } from '@apollo/client';

export const GET_ANNOUNCEMENTS = gql`
  query getAnnouncements {
    announcements {
      id
      schemeId
      stealthAddress
      ephemeralPubKey
      metadata
      block_number
      transactionHash_
      timestamp_
    }
  }
`