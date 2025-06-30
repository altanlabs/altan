export interface KeyValue {
  key: string;
  value: string;
}

export interface Webhook {
  name: string;
  url: string;
  details?: {
    schema?: {
      body?: any;
      methods?: string[];
      query_params?: any;
      route_path?: string;
    };
  };
}

export interface FormData {
  [key: string]: any;
}

export interface RequestState {
  method: string;
  url: string;
  headers: KeyValue[];
  queryParams: KeyValue[];
  body: string;
}

export interface SchemaProperty {
  type?: string;
  title?: string;
  description?: string;
  enum?: any[];
  enumDescriptions?: string[];
  default?: any;
  minimum?: number;
  maximum?: number;
  format?: string;
  properties?: {
    [key: string]: SchemaProperty;
  };
  required?: string[];
  [key: string]: any;
}

export interface Schema {
  body?: {
    type?: string;
    properties?: {
      [key: string]: SchemaProperty;
    };
    required?: string[];
  };
  methods?: string[];
  query_params?: {
    type?: string;
    properties?: {
      [key: string]: SchemaProperty;
    };
    required?: string[];
  };
  route_path?: string;
}
