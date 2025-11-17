export interface RequestedSecret {
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export interface AuthorizationRequestMetaData {
  type: 'secrets' | 'connection';
  requested_secrets?: RequestedSecret[];
}

export interface AuthorizationRequest {
  id: string;
  name?: string;
  connection_type_id?: string;
  callback_id?: string;
  date_creation: string;
  meta_data?: AuthorizationRequestMetaData;
}

export interface SecretValues {
  [key: string]: string;
}

export interface Member {
  id: string;
  member?: {
    agent?: {
      name?: string;
    };
  };
}

export interface MembersState {
  byId?: {
    [key: string]: Member;
  };
}

