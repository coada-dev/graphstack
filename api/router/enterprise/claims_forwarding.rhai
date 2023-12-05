fn process_request(request) {
    let claims = request.context[Router.APOLLO_AUTHENTICATION_JWT_CLAIMS];
    if claims ==() {
      throw #{
        status: 401
      };
    }
    // Add each claim key-value pair as a separate HTTP header.
    // Note that that claims that are not present in the JWT will be added as empty strings.
    let claim_names = ["username", "scope"];
    for claim_name in claim_names {
      let claim = claims[claim_name];
      claim = if claim == () {""} else {claim};
      request.subgraph.headers[claim_name] = claim;
    }
}