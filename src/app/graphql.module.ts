import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache, from } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { onError } from '@apollo/client/link/error';
import { Subject } from 'rxjs';

const uri = '/api/graphql'; // <-- add the URL of the GraphQL server here

export function createApollo(
  httpLink: HttpLink,
  graphQLModule: GraphQLModule,
): ApolloClientOptions<any> {

  const link = httpLink.create({ uri });

  const errorLink = onError(({ graphQLErrors }) => {

    const isAuthenticationError = graphQLErrors?.some((e) => e.extensions?.['code'] === 'UNAUTHENTICATED');

    if (isAuthenticationError) {
      graphQLModule.onAuthenticationError.next();
    }

  });

  return {
    link: from([ errorLink, link ]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            exerciseItems: {
              merge(_existing, incoming) {
                return incoming;
              }
            }
          }
        },
        WorkoutTemplate: {
          fields: {
            exerciseTemplates: {
              merge(_existing, incoming) {
                return incoming;
              }
            }
          }
        },
        ExerciseTemplate: {
          fields: {
            setTemplates: {
              merge(_existing, incoming) {
                return incoming;
              }
            }
          }
        },
        Exercise: {
          fields: {
            sets: {
              merge(_existing, incoming) {
                return incoming;
              }
            }
          }
        },
        Schedule: {
          fields: {
            weeks: {
              merge(_existing, incoming) {
                return incoming;
              }
            }
          }
        },
        ScheduleWeek: {
          fields: {
            workouts: {
              merge(_existing, incoming) {
                return incoming;
              }
            }
          }
        },
        Program: {
          fields: {
            workouts: {
              merge(_existing, incoming) {
                return incoming;
              }
            }
          }
        }
      }
    }),
  };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [
        HttpLink,
        GraphQLModule,
      ],
    },
  ],
})
export class GraphQLModule {

  onAuthenticationError = new Subject<void>();

}
