// Apollo client for connecting to GraphQL endpoints.
import { ApolloClient, InMemoryCache } from '@apollo/client';

const GRAPHQL_URL = '/api/graphql';

const client = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache(),
});

export default client;