# Overview

This is about how to use mongoose models.

# Methods

## Document-level Methods
Document-level methods are specific to individual documents, or instances of a Model. For instance, the save() method employed in this project is a document-level method because it only acts upon and saves that particular record. An additional example would be the [`findSimilarTypes` method highlighted in the mongoose tutorial](https://mongoosejs.com/docs/guide.html#methods). This is also a document-level method.

It's worth noting a distinction: while `findSimilarTypes` is a document-level method, it operates as an `instance method` encapsulated within the model.

## Model-level Methods
Model-level methods affect all documents in the collection. They can be employed for tasks like retrieving the minimum value from the records or sorting all documents. These methods can be divided into two categories:
1. `Queries`:
   1. `Query Helpers`: These are encapsulated within the schema and provide convenient ways to modify or enhance queries
   2. `Queries`: Direct operations or actions on the model affecting multiple records.
2. `Statics`

In many scenarios, the functionalities of query methods can be replicated using static methods, and vice versa. However, they differ in their usage nuances.

For example:
```typescript
userSchema.statics.findByAge = async function(age: number) {
    return await this.find({ age: age }).exec();
};

const ages = await User.findByName(25); // use static method directly on the Model.
```

```typescript
userSchema.query.byAge = async function(age: number) {
    return await this.where({ age: age }).exec();
};

const ages = await User.find().byAge(25); // use find() to initialize a query.
```

Static methods are invoked directly on the Model. On the other hand, query methods are designed to be chained to a Mongoose query, as seen when the `find()` function initializes a Mongoose query.

TODO: add more examples from the codes.


# Naming Convention
Mongoose, by default, will automatically look for the plural, lowercase version of your model name when it creates a collection in MongoDB. This is a naming convention that Mongoose follows to create the collection name from the model name.

For example: the model name is `JobPostingCount` but the collection name Mongoose derives is `jobpostingcounts`.