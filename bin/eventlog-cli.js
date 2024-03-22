#!/usr/bin/env node

const { program } = require('commander');
const { createHash } = require('crypto');
const { discoverLog, 
        listEvents, 
        getEvent,
        canonizeEvent,
        listEventMementos
    } = require('../lib/eventlog.js');

program
  .name('memento-cli')
  .version('1.0.1')
  .description('CLI to Event Logs');

program.command('where')
  .option('-f, --for <url>','Artifact url')
  .argument('<url>', 'Artifact|Service url')
  .action( async (url,options) => {
    let loc;

    if (options['for']) {
      loc = await discoverLog(options['for'],url);
    }
    else {
      loc = await discoverLog(url);
    }
    
    if (loc) {
        console.log(loc);
    }
  });

program.command('list') 
  .argument('<url>', 'EventLog url')
  .action( async (url) => {
    const log = await listEvents(url);
    if (log) {
        console.log(JSON.stringify(log,null,2));
    }
  });

program.command('list-all')
  .argument('<url>', 'EventLog url')
  .action( async (url) => {
    const log = await listEvents(url);
    const result = [];
    if (log) {
      for (let i = 0 ; i < log.length ; i++) {
        const event = await eventDetails(log[i]);
        result.push(event);   
      }

      console.log(JSON.stringify(result,null,2));
    }
  });

program.command('get') 
  .argument('<url>', 'Event url')
  .action( async (url) => {
    const event = await eventDetails(url);
    console.log(JSON.stringify(event,null,2));
  });

program.command('list-mementos')
  .argument('<url>', 'Event url')
  .action( async (url) => {
    const mementos = await listEventMementos(url);
  });

program.parse();

async function eventDetails(url) {
  const event = await getEvent(url);
  const canonical = await canonizeEvent(event['_body']);
  event['sha256'] = sha256(canonical);
  delete event['_body'];
  return event;
}

function sha256(data) {
  return createHash('sha256').update(data).digest('base64');
}