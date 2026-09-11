# Tweetme

Tweetme is a small, data-only sample containing ten promotional post templates in [`tweets.json`](tweets.json). It is not a bot or application.

There is no scheduler, social-platform API client, authentication flow, command listener, or publishing code in this repository. Nothing here posts content automatically. Some templates use theatrical technology metaphors; those words do not describe real access to accounts, devices, passwords, or data.

## Data format

The file has two fields:

- `triggerPhrase`: a non-empty label associated with the collection.
- `tweets`: exactly ten unique, non-empty strings, each no longer than 280 Unicode characters.

[`tweets.schema.json`](tweets.schema.json) is the machine-readable JSON Schema. The repository does not define how another program should select, schedule, or publish a template.

## Validate

Node.js 20 or later is required. The validator uses only Node's built-in modules, so there are no packages to install.

```sh
npm test
```

The same validation runs in GitHub Actions for pushes and pull requests.

## License

The repository's text and code are available under the [MIT License](LICENSE).
