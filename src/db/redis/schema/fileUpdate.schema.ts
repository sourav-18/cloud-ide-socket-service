import { SCHEMA_FIELD_TYPE } from "redis";

export default {
    '$.update': {
        type: SCHEMA_FIELD_TYPE.NUMERIC,
        AS: 'update'
    }
};
