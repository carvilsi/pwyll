import express from 'express';

// check if the mandatory parameters are comming
// from request depending on check value:
// body (default), params, query
export function paramCheck(
  req: express.Request,
  mandatoryParams: Array<string>,
  { check = 'body' }: { check?: string } = {}
): void {
  for (const mandatoryParam of mandatoryParams) {
    const errMessage = `bad request for endpoint, mandatory: ${mandatoryParam}`;
    switch (check) {
      case 'body':
        if (req.body[mandatoryParam] == null) throw errMessage;
        break;
      case 'params':
        if (req.params[mandatoryParam] == null) throw errMessage;
        break;
      case 'query':
        if (req.query[mandatoryParam] == null) throw errMessage;
        break;
      default:
        break;
    }
  }
}
