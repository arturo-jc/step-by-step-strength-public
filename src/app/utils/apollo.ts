import { ApolloError } from '@apollo/client/core';

export function getApolloErrorMessage(error: ApolloError) {
    const { graphQLErrors, message } = error;
    return graphQLErrors?.length ? graphQLErrors[0].message : message;
}

