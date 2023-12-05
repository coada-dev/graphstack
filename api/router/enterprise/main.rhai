import "claims_forwarding" as claims_forwarding;

fn subgraph_service(service, subgraph) {
    let request_callback = |request| {
        claims_forwarding::process_request(request);
    };

    service.map_request(request_callback);
}