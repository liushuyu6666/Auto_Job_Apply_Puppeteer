import mongoose, { Connection } from 'mongoose';

export async function mongodbConnection(database: string): Promise<Connection> {
    await mongoose.connect(`mongodb://localhost:27017/${database}`);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        console.log('Connected to MongoDB');
    });
    return db;
}
