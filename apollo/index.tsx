import React, { PropsWithChildren } from 'react'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  ApolloLink,
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'

const announcerLink = new HttpLink({
  uri: 'https://api.goldsky.com/api/public/project_cm1snr4gm7hfu01x770717n4n/subgraphs/announcer/1.0.0/gn',
})

const registryLink = new HttpLink({
  uri: 'https://api.goldsky.com/api/public/project_cm1snr4gm7hfu01x770717n4n/subgraphs/registry/1.0.0/gn',
})

const link = ApolloLink.split(
  (operation) => {
    const definition = getMainDefinition(operation.query)
    return definition.name?.value.includes('Announcement') ?? false
  },
  announcerLink, // if true
  registryLink, // if false
)

const client = new ApolloClient({
  link,
  // uri: 'https://api.goldsky.com/api/public/project_cm1snr4gm7hfu01x770717n4n/subgraphs/announcer/1.0.0/gn',
  // uri: 'https://api.goldsky.com/api/public/project_cm1snr4gm7hfu01x770717n4n/subgraphs/registry/1.0.0/gn',
  cache: new InMemoryCache(),
})

const ApolloProviderApps = ({ children }: PropsWithChildren) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
)

export default ApolloProviderApps
