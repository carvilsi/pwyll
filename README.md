<div class="text" align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/carvilsi/pwyll/c.yml?logo=github&label=tests" alt="test">
  <p></p>
  <p>
    <img src="https://github.com/carvilsi/pwyll/blob/main/img/pwyll.png" alt="pwyll" >
  </p>
  <p>a simple snippet manager service</p>
</div>

# pwyll 

This is the server side of Pwyll.

If you want to interact with pwyll, there is a **cli** for **nodejs** [pwyll-cli](https://github.com/carvilsi/pwyll-cli)

## Run

Pwyll server needs a MongoDB connection in order to store the snippets.

### Docker

No doubt about that one of the most useful ways to run it is with Docker. There is a Docker volume, so the data will be persisted.

Build the Docker image for pwyll:

`$ ./dokcer-build.sh`

then go to the **devops** directory and run the following command, which will start the pwyll server and MongoDB:

`$ docker-compose up -d`

Notice that if you are going to run this in a server with internet connectivity, you should change the configuration parameters for the MongoDB like username a password. Also most probably, you should run this with some kind of secure connection with **letsencrypt**.

## Testing

Apart from the CI/CD configured for GitHub workflows, you can run the test locally, to do that:

- First run the pwyll server with `$ npm run build && npm start`
- Then run the tests with `$ npm run dev-test` this will start a dockerized MongoDB and will run the tests.

If you do not want to have Docker, then just run an instance of MongoDB locally and witht the pwyll server runinng, execute the tests with `$ ./node_modules/jest/bin/jest.js --runInBand test/`. Notice that the tests need to run on a clean database.

---

Feedback from usage and contributions are very welcome.
Also if you like it, please leave a :star: I would appreciate it ;)

<3 & Hack the Planet!
