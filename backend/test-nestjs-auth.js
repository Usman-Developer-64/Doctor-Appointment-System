const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { AuthService } = require('./dist/auth/auth.service');
const { UsersService } = require('./dist/users/users.service');

async function test() {
  try {
    // First compile/ensure TS files are built if needed, but since we are running in dev mode,
    // let's bootstrap it with ts-node!
    console.log('Bootstrapping NestJS application...');
  } catch (e) {
    console.error(e);
  }
}
test();
