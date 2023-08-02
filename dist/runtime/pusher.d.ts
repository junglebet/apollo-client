export default PusherLink;
declare class PusherLink extends ApolloLink {
    constructor(options: any);
    pusher: any;
    request(operation: any, forward: any): Observable<any>;
    subscribeToChannel(subscriptionChannel: any, observer: any): void;
    unsubscribeFromChannel(subscriptionChannel: any): void;
}
import { ApolloLink } from "@apollo/client/link/core";
import { Observable } from "@apollo/client/core";
