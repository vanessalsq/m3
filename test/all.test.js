// ---all.COMM---

const id = require('../distribution/util/id');
global.config = {ip: '127.0.0.1', port: 8080};
const distribution = require('../distribution');

const globalGroup = {};

beforeAll((done) => {
  const n1 = {ip: '127.0.0.1', port: 8000};
  const n2 = {ip: '127.0.0.1', port: 8001};
  const n3 = {ip: '127.0.0.1', port: 8002};

  // First, stop the nodes if they are running
  let remote = {service: 'status', method: 'stop'};
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
      });
    });
  });

  globalGroup[id.getSID(n1)] = n1;
  globalGroup[id.getSID(n2)] = n2;
  globalGroup[id.getSID(n3)] = n3;

  distribution.local.status.spawn(n1, (e, v) => {
    distribution.local.status.spawn(n2, (e, v) => {
      distribution.local.status.spawn(n3, (e, v) => {
        distribution.all.groups({gid: 'global'})
            .put('global', globalGroup, (e, v) => {
              done();
            });
      });
    });
  });
});

afterAll((done) => {
  distribution.global.status.stop((e, v) => {
    const nodeToSpawn = {ip: '127.0.0.1', port: 8008};
    let remote = {node: nodeToSpawn, service: 'status', method: 'stop'};
    distribution.local.comm.send([], remote, (e, v) => {
      // distribution.local.status.stop();
      done();
    });
  });
});

test('(4 pts) all.comm.send(status.get(nid))', (done) => {
  const nids = Object.values(globalGroup).map((node) => id.getNID(node));
  const remote = {service: 'status', method: 'get'};

  distribution.global.comm.send(['nid'], remote, (e, v) => {
    expect(e).toEqual({});
    expect(Object.values(v).length).toBe(nids.length);
    expect(Object.values(v)).toEqual(expect.arrayContaining(nids));
    done();
  });
});

test('(2 pts) all.comm.send(status.get(random))', (done) => {
  const remote = {service: 'status', method: 'get'};

  distribution.global.comm.send(['random'], remote, (e, v) => {
    Object.keys(globalGroup).forEach((sid) => {
      expect(e[sid]).toBeDefined();
      expect(e[sid]).toBeInstanceOf(Error);
    });
    expect(v).toEqual({});
    done();
  });
});

// // ---all.GROUPS---

test('(2 pts) all.groups.del(random)', (done) => {
  distribution.global.groups.del('random', (e, v) => {
    Object.keys(globalGroup).forEach((sid) => {
      expect(e[sid]).toBeDefined();
      expect(e[sid]).toBeInstanceOf(Error);
    });
    expect(v).toEqual({});
    done();
  });
});

test('(2 pts) all.groups.put(browncs)', (done) => {
  let g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '12ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.global.groups.put('browncs', g, (e, v) => {
    expect(e).toEqual({});
    Object.keys(globalGroup).forEach((sid) => {
      expect(v[sid]).toEqual(g);
    });
    done();
  });
});

test('(2 pts) all.groups.put/get(browncs)', (done) => {
  let g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '12ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.global.groups.put('browncs', g, (e, v) => {
    distribution.global.groups.get('browncs', (e, v) => {
      expect(e).toEqual({});
      Object.keys(globalGroup).forEach((sid) => {
        expect(v[sid]).toEqual(g);
      });
      done();
    });
  });
});

test('(2 pts) all.groups.put/get/del(browncs)', (done) => {
  let g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '12ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.global.groups.put('browncs', g, (e, v) => {
    distribution.global.groups.get('browncs', (e, v) => {
      distribution.global.groups.del('browncs', (e, v) => {
        expect(e).toEqual({});
        Object.keys(globalGroup).forEach((sid) => {
          expect(v[sid]).toEqual(g);
        });
        done();
      });
    });
  });
});

test('(2 pts) all.groups.put/get/del/get(browncs)', (done) => {
  let g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '12ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.global.groups.put('browncs', g, (e, v) => {
    distribution.global.groups.get('browncs', (e, v) => {
      distribution.global.groups.del('browncs', (e, v) => {
        distribution.global.groups.get('browncs', (e, v) => {
          expect(e).toBeDefined();
          Object.keys(globalGroup).forEach((sid) => {
            expect(e[sid]).toBeInstanceOf(Error);
          });
          expect(v).toEqual({});
          done();
        });
      });
    });
  });
});

test('(2 pts) all.groups.put(dummy)/add(n1)/get(dummy)', (done) => {
  let g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '12ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.global.groups.put('dummy', g, (e, v) => {
    let n1 = {ip: '127.0.0.1', port: 8082};

    distribution.global.groups.add('dummy', n1, (e, v) => {
      let expectedGroup = {
        ...g, ...{[id.getSID(n1)]: n1},
      };

      distribution.global.groups.get('dummy', (e, v) => {
        expect(e).toEqual({});
        Object.keys(globalGroup).forEach((sid) => {
          expect(v[sid]).toEqual(expectedGroup);
        });
        done();
      });
    });
  });
});

test('(2 pts) all.groups.put(dummy)/rem(n1)/get(dummy)', (done) => {
  let g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '12ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.global.groups.put('browncs', g, (e, v) => {
    distribution.global.groups.rem('browncs', '507aa', (e, v) => {
      let expectedGroup = {
        '12ab0': {ip: '127.0.0.1', port: 8081},
      };

      distribution.global.groups.get('browncs', (e, v) => {
        expect(e).toEqual({});
        Object.keys(globalGroup).forEach((sid) => {
          expect(v[sid]).toEqual(expectedGroup);
        });
        done();
      });
    });
  });
});

// // ---all.ROUTES---

test('(2 pts) all.routes.put(echo)', (done) => {
  const echoService = {};

  echoService.echo = () => {
    return 'echo!';
  };

  distribution.global.routes.put(echoService, 'echo', (e, v) => {
    const n1 = {ip: '127.0.0.1', port: 8000};
    const n2 = {ip: '127.0.0.1', port: 8001};
    const n3 ={ip: '127.0.0.1', port: 8002};
    const r1 = {node: n1, service: 'routes', method: 'get'};
    const r2 = {node: n2, service: 'routes', method: 'get'};
    const r3 = {node: n3, service: 'routes', method: 'get'};

    global.distribution.local.comm.send(['echo'], r1, (e, v) => {
      expect(e).toBeFalsy();
      expect(v.echo()).toBe('echo!');
      global.distribution.local.comm.send(['echo'], r2, (e, v) => {
        expect(e).toBeFalsy();
        expect(v.echo()).toBe('echo!');
        global.distribution.local.comm.send(['echo'], r3, (e, v) => {
          expect(e).toBeFalsy();
          expect(v.echo()).toBe('echo!');
          done();
        });
      });
    });
  });
});

// ---all.STATUS---

test('(2 pts) all.status.get(nid)', (done) => {
  const nids = Object.values(globalGroup).map((node) => id.getNID(node));

  distribution.global.status.get('nid', (e, v) => {
    expect(e).toEqual({});
    expect(Object.values(v).length).toBe(nids.length);
    expect(Object.values(v)).toEqual(expect.arrayContaining(nids));
    done();
  });
});

test('(2 pts) all.status.get(random)', (done) => {
  distribution.global.status.get('random', (e, v) => {
    Object.keys(globalGroup).forEach((sid) => {
      expect(e[sid]).toBeDefined();
      expect(e[sid]).toBeInstanceOf(Error);
    });
    expect(v).toEqual({});
    done();
  });
});

test('(2 pts) all.status.spawn/stop()', (done) => {
  // Spawn a node
  const nodeToSpawn = {ip: '127.0.0.1', port: 8008};

  // Spawn the node
  distribution.global.status.spawn(nodeToSpawn, (e, v) => {
    expect(e).toBeFalsy();
    expect(v).toEqual(nodeToSpawn);

    remote = {node: nodeToSpawn, service: 'status', method: 'get'};
    message = [
      'nid', // configuration
    ];

    // Ping the node, it should respond
    global.distribution.local.comm.send(message, remote, (e, v) => {
      expect(e).toBeFalsy();
      expect(v).toBe(id.getNID(nodeToSpawn));

      global.distribution.local.groups.get('global', (e, v) => {
        expect(e).toBeFalsy();
        expect(v[id.getSID(nodeToSpawn)]).toBeDefined();

        remote = {node: nodeToSpawn, service: 'status', method: 'stop'};

        // Stop the node
        global.distribution.local.comm.send([], remote, (e, v) => {
          expect(e).toBeFalsy();
          expect(v).toEqual(nodeToSpawn);

          remote = {node: nodeToSpawn, service: 'status', method: 'get'};

          // Ping the node again, it shouldn't respond
          global.distribution.local.comm.send(message,
              remote, (e, v) => {
                expect(e).toBeDefined();
                expect(e).toBeInstanceOf(Error);
                expect(v).toBeFalsy();
                done();
              });
        });
      });
    });
  });
});

// ---all.GOSSIP---

test('(6 pts) all.gossip.send()', (done) => {
  global.distribution.global.groups.put('newgroup', {}, (e, v) => {
    let newNode = {ip: '127.0.0.1', port: 4444};
    let message = [
      'newgroup',
      newNode,
    ];

    let remote = {service: 'groups', method: 'add'};
    global.distribution.global.gossip.send(message, remote, (e, v) => {
      global.distribution.global.groups.get('newgroup', (e, v) => {
        let count = 0;
        for (const k in v) {
          if (Object.keys(v[k]).length > 0) {
            count++;
          }
        }
        /* Gossip only provides weak guarantees */
        expect(count).toBeGreaterThanOrEqual(2);
        done();
      });
    });
  });
});
