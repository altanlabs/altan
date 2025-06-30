import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { Typography, Box, IconButton, MenuItem, Select, Chip, Stack } from '@mui/material';
import React, { useState, useEffect } from 'react';

const voices = [
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: {},
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: {},
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      use_case: 'news',
      gender: 'female',
      age: 'young',
      description: 'soft',
      accent: 'american',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'FGY2WhTYpPnrIDTdsKH5',
    name: 'Laura',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: {
        eleven_turbo_v2: 'fine_tuned',
        eleven_multilingual_v2: 'fine_tuned',
        eleven_turbo_v2_5: 'fine_tuned',
      },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2_5: '', eleven_turbo_v2: '', eleven_multilingual_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      gender: 'female',
      accent: 'American',
      use_case: 'social media',
      age: 'young',
      description: 'upbeat',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/FGY2WhTYpPnrIDTdsKH5/67341759-ad08-41a5-be6e-de12fe448618.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'IKne3meq5aSn9XLyUdCD',
    name: 'Charlie',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      gender: 'male',
      use_case: 'conversational',
      age: 'middle aged',
      description: 'natural',
      accent: 'Australian',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/102de6f2-22ed-43e0-a1f1-111fa75c5481.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: [
      'eleven_multilingual_v1',
      'eleven_turbo_v2',
      'eleven_multilingual_v2',
      'eleven_turbo_v2_5',
    ],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      use_case: 'narration',
      description: 'warm',
      accent: 'British',
      gender: 'male',
      age: 'middle aged',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-4787-aafb-06a6e705cac5.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'N2lVS1w4EtoT3dr4eOWO',
    name: 'Callum',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      accent: 'Transatlantic',
      age: 'middle-aged',
      use_case: 'characters',
      gender: 'male',
      description: 'intense',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/N2lVS1w4EtoT3dr4eOWO/ac833bd8-ffda-4938-9ebc-b0f99ca25481.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: [
      'eleven_multilingual_v1',
      'eleven_turbo_v2',
      'eleven_multilingual_v2',
      'eleven_turbo_v2_5',
    ],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'TX3LPaxmHKxFdv7VOQHJ',
    name: 'Liam',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      gender: 'male',
      age: 'young',
      use_case: 'narration',
      accent: 'American',
      description: 'articulate',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/63148076-6363-42db-aea8-31424308b92c.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: [
      'eleven_multilingual_v1',
      'eleven_turbo_v2',
      'eleven_multilingual_v2',
      'eleven_turbo_v2_5',
    ],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'XB0fDUnXU5powFXDhCwa',
    name: 'Charlotte',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_multilingual_v2: '', eleven_turbo_v2_5: '', eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      age: 'young',
      use_case: 'characters',
      accent: 'Swedish',
      gender: 'female',
      description: 'seductive',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/XB0fDUnXU5powFXDhCwa/942356dc-f10d-4d89-bda5-4f8505ee038b.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: [
      'eleven_multilingual_v1',
      'eleven_turbo_v2',
      'eleven_multilingual_v2',
      'eleven_turbo_v2_5',
    ],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
    name: 'Alice',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      description: 'confident',
      use_case: 'news',
      accent: 'British',
      gender: 'female',
      age: 'middle-aged',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f7534-11f6-41fe-a012-2de1e482d336.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'XrExE9yKIg1WjnnlVkGX',
    name: 'Matilda',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      use_case: 'narration',
      age: 'middle-aged',
      gender: 'female',
      description: 'friendly',
      accent: 'American',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/b930e18d-6b4d-466e-bab2-0ae97c6d8535.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: [
      'eleven_multilingual_v1',
      'eleven_turbo_v2',
      'eleven_multilingual_v2',
      'eleven_turbo_v2_5',
    ],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'bIHbv24MWmeRgasZH58o',
    name: 'Will',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: {
        eleven_multilingual_v2: 'fine_tuned',
        eleven_turbo_v2_5: 'fine_tuned',
        eleven_turbo_v2: 'fine_tuned',
      },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_multilingual_v2: '', eleven_turbo_v2_5: '', eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      age: 'young',
      description: 'friendly',
      gender: 'male',
      use_case: 'social media',
      accent: 'American',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/bIHbv24MWmeRgasZH58o/8caf8f3d-ad29-4980-af41-53f20c72d7a4.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'cgSgspJ2msm6clMCkdW9',
    name: 'Jessica',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: {
        eleven_turbo_v2_5: 'fine_tuned',
        eleven_multilingual_v2: 'fine_tuned',
        eleven_turbo_v2: 'fine_tuned',
      },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '', eleven_multilingual_v2: '', eleven_turbo_v2_5: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      use_case: 'conversational',
      gender: 'female',
      description: 'expressive',
      age: 'young',
      accent: 'American',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'cjVigY5qzO86Huf0OWal',
    name: 'Eric',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: {
        eleven_multilingual_v2: 'fine_tuned',
        eleven_turbo_v2: 'fine_tuned',
        eleven_turbo_v2_5: 'fine_tuned',
      },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '', eleven_multilingual_v2: '', eleven_turbo_v2_5: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      gender: 'male',
      age: 'middle-aged',
      description: 'friendly',
      accent: 'American',
      use_case: 'conversational',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/cjVigY5qzO86Huf0OWal/d098fda0-6456-4030-b3d8-63aa048c9070.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'iP95p4xoKVk53GoZ742B',
    name: 'Chris',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      accent: 'American',
      use_case: 'conversational',
      description: 'casual',
      age: 'middle-aged',
      gender: 'male',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/iP95p4xoKVk53GoZ742B/3f4bde72-cc48-40dd-829f-57fbf906f4d7.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'nPczCjzI2devNBz1zQrb',
    name: 'Brian',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      description: 'deep',
      accent: 'American',
      use_case: 'narration',
      gender: 'male',
      age: 'middle-aged',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/2dd3e72c-4fd3-42f1-93ea-abc5d4e5aa1d.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      gender: 'male',
      age: 'middle-aged',
      accent: 'British',
      description: 'authoritative',
      use_case: 'news',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/7eee0236-1a72-4b86-b303-5dcadc007ba9.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: [
      'eleven_multilingual_v1',
      'eleven_turbo_v2',
      'eleven_multilingual_v2',
      'eleven_turbo_v2_5',
    ],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'pFZP5JQG7iQjIQuC4Bku',
    name: 'Lily',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      use_case: 'narration',
      age: 'middle-aged',
      gender: 'female',
      description: 'warm',
      accent: 'British',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/89b68b35-b3dd-4348-a84a-a3c13a3c2b30.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
  {
    voice_id: 'pqHfZKP75CvOlQylNhV4',
    name: 'Bill',
    samples: null,
    category: 'premade',
    fine_tuning: {
      is_allowed_to_fine_tune: true,
      state: { eleven_turbo_v2: 'fine_tuned' },
      verification_failures: [],
      verification_attempts_count: 0,
      manual_verification_requested: false,
      language: 'en',
      progress: {},
      message: { eleven_turbo_v2: '' },
      dataset_duration_seconds: null,
      verification_attempts: null,
      slice_ids: null,
      manual_verification: null,
    },
    labels: {
      accent: 'American',
      description: 'trustworthy',
      gender: 'male',
      use_case: 'narration',
      age: 'old',
    },
    description: null,
    preview_url:
      'https://storage.googleapis.com/eleven-public-prod/premade/voices/pqHfZKP75CvOlQylNhV4/d782b3ff-84ba-4029-848c-acf01285524d.mp3',
    available_for_tiers: [],
    settings: null,
    sharing: null,
    high_quality_base_model_ids: ['eleven_turbo_v2', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'],
    safety_control: null,
    voice_verification: {
      requires_verification: false,
      is_verified: false,
      verification_failures: [],
      verification_attempts_count: 0,
      language: null,
      verification_attempts: null,
    },
    owner_id: null,
    permission_on_resource: null,
    is_legacy: false,
  },
];

const VoiceSection = ({ onChange, value }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const handleVoiceChange = (event) => {
    const voiceId = event.target.value;
    onChange(voiceId);
  };

  const handlePlayPreview = (url) => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    const newAudio = new Audio(url);
    setAudio(newAudio);
    newAudio.play();
    setIsPlaying(true);
    setPreviewUrl(url);
  };

  const handleStopPreview = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <Select
        name="voiceId"
        size="small"
        onChange={handleVoiceChange}
        value={value || ''}
        fullWidth
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <Typography color="textSecondary">Select a voice</Typography>;
          }
          const selectedOption = voices.find((option) => option.voice_id === selected);
          return (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>{selectedOption.name}</Box>
            </Box>
          );
        }}
      >
        <MenuItem
          value=""
          disabled
        >
          Select a voice
        </MenuItem>
        {voices && voices.length > 0 ? (
          voices.map((option) => (
            <MenuItem
              key={option.voice_id}
              value={option.voice_id}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPreview(option.preview_url);
                    }}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                  {isPlaying && previewUrl === option.preview_url && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStopPreview();
                      }}
                    >
                      <StopIcon />
                    </IconButton>
                  )}
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                >
                  <Box>{option.name}</Box>
                  <Chip
                    size="small"
                    label={option.labels.gender}
                  />
                  <Chip
                    size="small"
                    label={option.labels.age}
                  />
                  <Chip
                    size="small"
                    color="secondary"
                    variant="soft"
                    label={option.labels.use_case}
                  />
                  <Chip
                    size="small"
                    color="primary"
                    variant="soft"
                    label={option.labels.description}
                  />
                </Stack>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No voices available</MenuItem>
        )}
      </Select>
      {/* {value && !isPlaying && (
        <Box mt={2}>
          <audio controls>
            <source src={voices.find(voice => voice.voice_id === value).preview_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </Box>
      )} */}
    </>
  );
};

export default VoiceSection;
