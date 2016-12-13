import * as express from 'express';
import * as Knex from 'knex';
import * as _ from 'lodash';
import * as winston from 'winston';
import { Validator } from 'jsonschema';
import { schedule as schemas } from '../../schemas';

let knex = Knex({
    client: 'pg',
    connection: {
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
    },
});

let v: Validator = new Validator();

let router = express.Router();

router.param('id', (req, res, next, id) => {
    next();
});

/**
 * @apiName GetSchedules
 * @api {get} /api/v2/schedule
 * @apiGroup Schedule
 * @apiDescription Get schedule given by query params
 */
router.get('/', (req, res) => {
    let result = v.validate(req.query, schemas.getScheduleQuery);
    if (result.errors.length > 0) {
        return res.status(400).send({ error: result.errors[0] });
    }

    knex('schedule').where(req.query)
        .asCallback((err, schedules) => {
            if (err) return res.status(400).send(err);
            res.status(200).send(schedules);
        });
});

/**
 * @apiName GetSchedule
 * @api {get} /api/v2/schedule/:id
 * @apiGroup Schedule
 * @apiDescription Get schedule given by schedule id
 */
router.get('/:id', (req, res) => {
    let result = v.validate(req.params, schemas.getScheduleParams);
    if (result.errors.length > 0) {
        return res.status(400).send({ error: result.errors[0] });
    }

    knex('schedule').where(req.params).asCallback((err, rows) => {
        if (err) return res.status(400).send(err);
        if (rows.length > 0) return res.status(404).send({ error: `Schedule with id ${req.params.id} not found` });
        res.status(200).send(rows[0]);
    });
});

/**
 * @apiName CreateSchedule
 * @api {post} /api/v2/schedule
 * @apiGroup Schedule
 * @apiDescription Create schedule from request body
 */
router.post('/', (req, res) => {
    let result = v.validate(req.body, schemas.createSchedule);
    if (result.errors.length > 0) {
        return res.status(400).send({ error: result.errors[0] });
    }

    knex('schedule').insert(req.body, '*').asCallback((err, schedule) => {
        if (err) return res.status(400).send(err);
        if (schedule.length > 0) return res.status(404).send({ error: 'Schedule was not created' });
        res.status(200).send(schedule[0]);
    });
});

/**
 * @apiName UpdateSchedule
 * @api {get} /api/v2/schedule/:id
 * @apiGroup Schedule
 * @apiDescription Update schedule, by given schedule id, from body
 */
router.post('/:id', (req, res) => {
    let result = v.validate(req.params, schemas.getScheduleParams);
    if (result.errors.length > 0) {
        return res.status(400).send({ errors: result.errors[0] });
    }

    result = v.validate(req.body, schemas.updateScheduleParams);
    if (result.errors.length > 0) {
        return res.status(400).send({ errors: result.errors[0] });
    }

    req.body['modified_time'] = 'now()'

    knex('schedule').where(req.params).update(req.body, '*').asCallback((err, schedule) => {
        if (err) return res.status(400).send(err);
        if (schedule.length < 1) return res.status(404).send({ error: `Schedule with id ${req.params.id} not found` });
        res.status(200).send(schedule[0]);
    });
});

/**
 * @apiName GetScheduleData
 * @api {get} /api/v2/schedule/:id/data
 * @apiGroup Schedule
 * @apiDescription Get schedule data given by schedule id
 */
router.get('/:id/data', (req, res) => {
    let result = v.validate(req.query, schemas.getScheduleParams);
    if (result.errors.length > 0) {
        return res.status(400).send({ errors: result.errors[0] });
    }

    knex('schedule').select('data').where(req.params).asCallback((err, data) => {
        if (err) return res.status(400).send(err);
        if (data.length < 1) return res.status(404).send({
            error: `Schedule with id ${req.params.id} not found`
        });
        res.status(200).send(data[0]);
    });
});

/**
 * @apiName SetScheduleData
 * @api {get} /api/v2/schedule/:id
 * @apiGroup Schedule
 * @apiDescription Set schedule data for schedule with matching id to body
 */
router.post('/:id/data', (req, res) => {
    let result = v.validate(req.params, schemas.getScheduleParams);
    if (result.errors.length > 0) {
        return res.status(400).send({ errors: result.errors[0] });
    }

    result = v.validate(req.body, schemas.scheduleData);
    if (result.errors.length > 0) {
        return res.status(400).send({ errors: result.errors[0] });
    }

    req.body['modified_time'] = 'now()'

    knex('schedule').where(req.params)
        .update(req.body, '*')
        .asCallback((err, schedule) => {
            if (err) return res.status(400).send(err);
            if (schedule.length < 1) return res.status(404).send({ error: `Schedule with id ${req.params.id} not found` });
            res.status(200).send(schedule[0]);
        });
});

/**
 * @apiName GetScheduleResult
 * @api {get} /api/v2/schedule/:id/result
 * @apiGroup Schedule
 * @apiDescription Get schedule result from schedule given by schedule id
 */
router.get('/:id/result', (req, res) => {
    let result = v.validate(req.query, schemas.getScheduleParams);
    if (result.errors.length > 0) {
        return res.status(400).send({ errors: result.errors[0] });
    }

    knex('schedule').select('result').where(req.params).asCallback((err, result) => {
        if (err) return res.status(400).send(err);
        if (result.length < 1) return res.status(404).send({
            error: `Schedule with id ${req.params.id} not found`
        });
        res.status(200).send(result[0]);
    });
});

/**
 * @apiName SetScheduleResult
 * @api {get} /api/v2/schedule/:id/result
 * @apiGroup Schedule
 * @apiDescription Set schedule result for schedule matching id with body
 */
router.post('/:id/result', (req, res) => {
    let result = v.validate(req.params, schemas.getScheduleParams);
    if (result.errors.length > 0) {
        return res.status(400).send({ errors: result.errors[0] });
    }

    result = v.validate(req.body, schemas.scheduleResult);
    if (result.errors.length > 0) {
        return res.status(400).send({ errors: result.errors[0] });
    }

    req.body['modified_time'] = 'now()'

    knex('schedule').where(req.params)
        .update(req.body, '*')
        .asCallback((err, schedule) => {
            if (err) return res.status(400).send(err);
            if (schedule.length < 1) return res.status(404).send({ error: `Schedule with id ${req.params.id} not found` });
            res.status(200).send(schedule[0]);
        });
});

export { router as schedule };
