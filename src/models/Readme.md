# Overview

This is about how to use mongoose models.

# Methods

## Document-level Methods
Document-level methods are specific to individual documents, or instances of a Model. For instance, the save() method employed in this project is a document-level method because it only acts upon and saves that particular record. An additional example would be the [`findSimilarTypes` method highlighted in the mongoose tutorial](https://mongoosejs.com/docs/guide.html#methods). This is also a document-level method.

It's worth noting a distinction: while `findSimilarTypes` is a document-level method, it operates as an `instance method` encapsulated within the model.

## Model-level Methods
Model-level methods affect all documents in the collection. They can be employed for tasks like retrieving the minimum value from the records or sorting all documents. These methods can be divided into two main categories:
1. `Query Helpers`: These are encapsulated within the schema and provide convenient ways to modify or enhance queries.
2. `Queries`: Direct operations or actions on the model affecting multiple records.

TODO: add more examples from the codes.


# Naming Convention
Mongoose, by default, will automatically look for the plural, lowercase version of your model name when it creates a collection in MongoDB. This is a naming convention that Mongoose follows to create the collection name from the model name.

For example: the model name is `JobPostingCount` but the collection name Mongoose derives is `jobpostingcounts`.