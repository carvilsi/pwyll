# Changelog

# [v3.1.0-release.0](https://github.com/carvilsi/pwyll/releases/tag/v3.1.0-release.0) (2024-03-14)

- increassing hashing algorithm to SHA3-512 
- dressing the secret with salt and pepper 
- adding tests
- this release it's going to break old users, you can export, trhow the database, create a new user and import the snippets again. Sorry, but I guess that anyone is using pwyll -.-

# [v3.0.0](https://github.com/carvilsi/pwyll/releases/tag/v3.0.0) (2024-03-04)

- added export functionality 
- added test for export functionality
- added more tests to update snippets
- improving tests
- adding info endpoint to retrieve object with version and name 
- adding test for info endpoint
- implemented user secret 
- improved herror handling 
- added linter to tests

# [v2.0.0](https://github.com/carvilsi/pwyll/releases/tag/v2.0.0) (2024-02-20)

- fixing linting thing
- adding info endpoint to retrieve object with version and name
- adding test for info endpoint
- implemted user secret 
- improved error handling 
- added linter to tests 
- added more tests

# [v1.1.1](https://github.com/carvilsi/pwyll/releases/tag/v1.1.1) (2024-02-15)

- adding audit npm on pre-release
- updating ip dependent due a high vulnerability
- small refactor about promises
- fixing git tagging script
- run workflow test when pushing to develop branch
- improved pre-release script

# [v1.1.0](https://github.com/carvilsi/pwyll/releases/tag/v1.1.0) (2024-02-09)

- added endpoint to retrieve snippet by ID
- improved the pre-release process: adding new CHANGELOG entry with latest commit message
- improving CI added prepublish on publish the docker image is taged and pushed to dockerhub place 

# [v1.0.4](https://github.com/carvilsi/pwyll/releases/tag/v1.0.4) (2024-02-08)

- Added new test
- Solved an issue with non closing connections of mongodb that was causing a memory leak 

# [v1.0.3](https://github.com/carvilsi/pwyll/releases/tag/v1.0.3) (2024-02-06)

- First public version, basic functionallity:
    - CRUD snippets (find snippets)
    - signin user
    - test & CI/CD

