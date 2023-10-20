import { model, Schema } from "dynamoose";
import { AnyItem, Item } from "dynamoose/dist/Item";

import { Model } from "dynamoose/dist/Model";
import { Schema as SchemaType } from "dynamoose/dist/Schema";

import { GraphQLError } from "graphql";

import dynamoDataSource from "@datasources/dynamodb";

interface User extends AnyItem, Item {}

export default class UsersDataSource {
  private model: Model;

  private schema: SchemaType;

  constructor(local = false) {
    dynamoDataSource(local);

    this.schema = new Schema(
      { id: String, name: String },
      {
        timestamps: true,
      },
    );

    this.model = model<User>("users", this.schema);
  }

  async createUser(id: string, name: string): Promise<User> {
    let response: User;

    try {
      response = await this.model.create({ id, name });
    } catch (error) {
      console.error(error, "error");
      throw new GraphQLError(error);
    }

    return response;
  }

  async getUser(id: string): Promise<User> {
    let response: User;

    try {
      response = await this.model.get({ id });
    } catch (error) {
      throw new GraphQLError(error);
    }

    return response;
  }

  async updateUser(id: string, name: string) {
    let response: User;

    try {
      response = await this.model.update({ id }, { name });
    } catch (error) {
      throw new GraphQLError(error);
    }

    return response;
  }
}