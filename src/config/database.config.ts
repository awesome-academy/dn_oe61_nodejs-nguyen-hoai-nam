
export default () => ({
    database: {
        type: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [],
        synchronize: false,
        logging: false,
    },
});
