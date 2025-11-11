import { Plus, Check, Trash2, Monitor } from 'lucide-react';
import { memo, useCallback, useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';

import { useSnackbar } from '../../../../components/snackbar';
import { Button } from '../../../../components/ui/button';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Separator } from '../../../../components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../../../components/ui/sheet';
import { Textarea } from '../../../../components/ui/textarea';
import { updateCurrentTool, getSpace } from '../../../../redux/slices/spaces';
import { dispatch, useSelector } from '../../../../redux/store';
import { optimai } from '../../../../utils/axios';

const DATA_TYPES = ['string', 'number', 'boolean', 'array', 'object'];

const VALUE_TYPES = [
  { value: 'ai', label: 'AI' },
  { value: 'fill', label: 'Constant' },
];

const TOOL_CALL_SOUNDS = [
  { value: 'none', label: 'None' },
  { value: 'typing', label: 'Typing' },
  { value: 'elevator_music_1', label: 'Elevator Music 1' },
  { value: 'elevator_music_2', label: 'Elevator Music 2' },
  { value: 'elevator_music_3', label: 'Elevator Music 3' },
  { value: 'elevator_music_4', label: 'Elevator Music 4' },
];

const SOUND_BEHAVIORS = [
  { value: 'auto', label: 'Auto' },
  { value: 'with_pre_speech', label: 'With pre-speech' },
  { value: 'always_play', label: 'Always play' },
];

const EXECUTION_MODES = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'post_speech', label: 'Post speech' },
  { value: 'async', label: 'Async' },
];

const ClientToolDrawer = ({ open, onClose, toolToEdit = null }) => {
  const { enqueueSnackbar } = useSnackbar();
  const currentAgent = useSelector((state) => state.agents.currentAgent);
  const currentSpace = useSelector((state) => state.spaces.current);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(toolToEdit);

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      parameters: [],
      meta_data: {
        response_timeout_secs: 120,
        disable_interruptions: false,
        force_pre_tool_speech: false,
        tool_call_sound: 'typing',
        tool_call_sound_behavior: 'auto',
        expects_response: true,
        execution_mode: 'immediate',
      },
    },
  });

  const { control, handleSubmit, reset } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parameters',
  });

  // Populate form when editing existing tool
  useEffect(() => {
    if (toolToEdit && open) {
      const tool = toolToEdit.tool;
      reset({
        name: tool.name || '',
        description: tool.description || '',
        parameters: tool.parameters || [],
        meta_data: {
          response_timeout_secs: tool.meta_data?.response_timeout_secs || 120,
          disable_interruptions: tool.meta_data?.disable_interruptions || false,
          force_pre_tool_speech: tool.meta_data?.force_pre_tool_speech || false,
          tool_call_sound: tool.meta_data?.tool_call_sound || 'typing',
          tool_call_sound_behavior: tool.meta_data?.tool_call_sound_behavior || 'auto',
          expects_response: tool.meta_data?.expects_response !== undefined ? tool.meta_data.expects_response : true,
          execution_mode: tool.meta_data?.execution_mode || 'immediate',
        },
      });
    } else if (!toolToEdit && open) {
      reset({
        name: '',
        description: '',
        parameters: [],
        meta_data: {
          response_timeout_secs: 120,
          disable_interruptions: false,
          force_pre_tool_speech: false,
          tool_call_sound: 'typing',
          tool_call_sound_behavior: 'auto',
          expects_response: true,
          execution_mode: 'immediate',
        },
      });
    }
  }, [toolToEdit, open, reset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleAddParameter = useCallback(() => {
    append({
      id: '',
      type: 'string',
      description: '',
      dynamic_variable: '',
      constant_value: '',
      required: false,
      value_type: 'ai',
    });
  }, [append]);

  const handleRemoveParameter = useCallback(
    (index) => {
      remove(index);
    },
    [remove],
  );

  const onSubmit = handleSubmit(async (data) => {
    if (!currentAgent?.id) {
      enqueueSnackbar('No agent selected. Please select an agent first.', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        tool_type: 'client',
        name: data.name,
        description: data.description,
        parameters: data.parameters,
        meta_data: {
          response_timeout_secs: data.meta_data.response_timeout_secs,
          disable_interruptions: data.meta_data.disable_interruptions,
          force_pre_tool_speech: data.meta_data.force_pre_tool_speech,
          tool_call_sound: data.meta_data.tool_call_sound,
          tool_call_sound_behavior: data.meta_data.tool_call_sound_behavior,
          expects_response: data.meta_data.expects_response,
          execution_mode: data.meta_data.execution_mode,
        },
      };

      // Call the appropriate API endpoint
      if (isEditMode) {
        const response = await optimai.patch(`/tool/${toolToEdit.tool.id}`, payload);
        const { tool } = response.data;
        dispatch(updateCurrentTool(tool));
        enqueueSnackbar('Client tool updated successfully!', { variant: 'success' });
      } else {
        await optimai.post(`/agent/${currentAgent.id}/add-tool`, payload);
        // Refetch space data to get updated tools list
        if (currentSpace?.id) {
          await dispatch(getSpace(currentSpace.id));
        }
        enqueueSnackbar('Client tool created successfully!', { variant: 'success' });
      }

      handleClose();
    } catch (error) {
      console.error('Error creating client tool:', error);
      enqueueSnackbar('Error creating client tool', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  });

  const renderHeader = (
    <SheetHeader className="p-6 pb-4 border-b">
      <div className="flex items-center gap-3">
        <Monitor className="h-6 w-6" />
        <SheetTitle className="text-xl">{isEditMode ? 'Edit' : 'Add'} client tool</SheetTitle>
      </div>
    </SheetHeader>
  );

  const renderConfigurationSection = (
    <div className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Describe to the LLM how and when to use the tool.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Tool name"
            {...methods.register('name', { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Tool description"
            {...methods.register('description')}
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderBehaviorSection = (
    <div className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Behavior Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how the tool executes and interacts with the agent.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="execution_mode">Execution Mode</Label>
          <Controller
            name="meta_data.execution_mode"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="execution_mode">
                  <SelectValue placeholder="Select execution mode" />
                </SelectTrigger>
                <SelectContent>
                  {EXECUTION_MODES.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Determines when and how the tool executes relative to agent speech.
          </p>
        </div>

        <div className="space-y-2">
          <Controller
            name="meta_data.expects_response"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expects_response"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="expects_response" className="cursor-pointer">
                  Expects response
                </Label>
              </div>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Select this box to make the agent wait for the tool to finish executing before resuming
            the conversation.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="response_timeout">Response Timeout (seconds)</Label>
          <Input
            id="response_timeout"
            type="number"
            {...methods.register('meta_data.response_timeout_secs', { valueAsNumber: true })}
            min={1}
            max={600}
          />
          <p className="text-xs text-muted-foreground">
            How long to wait for the client tool to respond before timing out. Default is 120 seconds.
          </p>
        </div>

        <div className="space-y-2">
          <Controller
            name="meta_data.disable_interruptions"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="disable_interruptions"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="disable_interruptions" className="cursor-pointer">
                  Disable interruptions
                </Label>
              </div>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Select this box to disable interruptions while the tool is running.
          </p>
        </div>

        <div className="space-y-2">
          <Controller
            name="meta_data.force_pre_tool_speech"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="force_pre_tool_speech"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="force_pre_tool_speech" className="cursor-pointer">
                  Force pre-tool speech
                </Label>
              </div>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Force agent speech before tool execution or let it decide automatically based on recent execution times.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tool_call_sound">Tool Call Sound</Label>
          <Controller
            name="meta_data.tool_call_sound"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="tool_call_sound">
                  <SelectValue placeholder="Select sound" />
                </SelectTrigger>
                <SelectContent>
                  {TOOL_CALL_SOUNDS.map((sound) => (
                    <SelectItem key={sound.value} value={sound.value}>
                      {sound.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Optional sound effect that plays during tool execution.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sound_behavior">Sound Behavior</Label>
          <Controller
            name="meta_data.tool_call_sound_behavior"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="sound_behavior">
                  <SelectValue placeholder="Select behavior" />
                </SelectTrigger>
                <SelectContent>
                  {SOUND_BEHAVIORS.map((behavior) => (
                    <SelectItem key={behavior.value} value={behavior.value}>
                      {behavior.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Determines when the tool call sound should play.
          </p>
        </div>
      </div>
    </div>
  );

  const renderParametersSection = (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Parameters</h3>
          <p className="text-sm text-muted-foreground">
            Define the parameters that will be sent with the event.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddParameter}
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add param
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative p-4 border rounded-lg space-y-4"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveParameter(index)}
              className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-4 pr-8">
              <div className="flex gap-2">
                <div className="w-[140px]">
                  <Label htmlFor={`param-type-${index}`}>Data type</Label>
                  <Controller
                    name={`parameters.${index}.type`}
                    control={control}
                    render={({ field: controllerField }) => (
                      <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                        <SelectTrigger id={`param-type-${index}`}>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DATA_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor={`param-id-${index}`}>Identifier</Label>
                  <Input
                    id={`param-id-${index}`}
                    {...methods.register(`parameters.${index}.id`, { required: true })}
                  />
                </div>
              </div>

              <Controller
                name={`parameters.${index}.required`}
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`param-required-${index}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor={`param-required-${index}`} className="cursor-pointer">
                      Required
                    </Label>
                  </div>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor={`param-value-type-${index}`}>Value Type</Label>
                <Controller
                  name={`parameters.${index}.value_type`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                      <SelectTrigger id={`param-value-type-${index}`}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VALUE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`param-desc-${index}`}>Description</Label>
                <Textarea
                  id={`param-desc-${index}`}
                  {...methods.register(`parameters.${index}.description`)}
                  placeholder="This field will be passed to the LLM and should describe in detail how to extract the data from the transcript."
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActions = (
    <div className="p-6 pt-4 border-t">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Saving...'
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {isEditMode ? 'Update Tool' : 'Create Tool'}
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="w-full sm:max-w-[600px] p-0 flex flex-col overflow-hidden">
        <FormProvider {...methods}>
          <div className="h-full flex flex-col">
            {renderHeader}

            <div className="flex-1 overflow-y-auto">
              {renderConfigurationSection}
              <Separator />
              {renderParametersSection}
              <Separator />
              {renderBehaviorSection}
            </div>

            {renderActions}
          </div>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
};

export default memo(ClientToolDrawer);
