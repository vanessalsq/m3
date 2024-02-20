/*
    IMPORTANT: This is a copy of the node.js provided for M2; a new verion of this file will be provided in 48 hours. Therefore, all comments below refer to M2.
*/


/*
    The start function will be called to start your node.
    It will take a callback as an argument.
    After your node has booted, you should call the callback.
*/


const start = function(started) {
  const server = http.createServer((req, res) => {
    /* Your server will be listening for PUT requests. */

    // Write some code...


    /*
      The path of the http request will determine the service to be used.
      The url will have the form: http://node_ip:node_port/service/method
    */


    // Write some code...


    /*

      A common pattern in handling HTTP requests in Node.js is to have a
      subroutine that collects all the data chunks belonging to the same
      request. These chunks are aggregated into a body variable.

      When the req.on('end') event is emitted, it signifies that all data from
      the request has been received. Typically, this data is in the form of a
      string. To work with this data in a structured format, it is often parsed
      into a JSON object using JSON.parse(body), provided the data is in JSON
      format.

      Our nodes expect data in JSON format.
  */

    // Write some code...


      /* Here, you can handle the service requests. */

      // Write some code...


        /*
      Here, we provide a default callback which will be passed to services.
      It will be called by the service with the result of it's call
      then it will serialize the result and send it back to the caller.
        */
        const serviceCallback = (e, v) => {
          res.end(serialization.serialize([e, v]));
        };

        // Write some code...

  });


  // Write some code...

  /*
    Your server will be listening on the port and ip specified in the config
    You'll need to call the started callback when your server has successfully
    started.

    In this milestone, you'll be passing the server object to this callback
    so that we can close the server when we're done with it.
    In future milestones, we'll add the abilitiy to stop the node
    through the service interface.
  */

  server.listen(global.config.port, global.config.ip, () => {
    started(server);
  });
};

module.exports = {
  start: start,
};
