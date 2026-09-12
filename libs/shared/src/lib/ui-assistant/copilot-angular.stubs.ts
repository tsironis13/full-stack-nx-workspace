import { Component, input } from '@angular/core';

@Component({
  selector: 'copilot-chat-assistant-message-renderer',
  template: '',
})
export class CopilotChatAssistantMessageRenderer {
  readonly content = input('');
  readonly inputClass = input('');
}

@Component({
  selector: 'copilot-render-tool-calls',
  template: '',
})
export class RenderToolCalls {
  readonly message = input<unknown>(null);
  readonly messages = input<unknown[]>([]);
  readonly agentId = input('');
  readonly isLoading = input(false);
}

@Component({
  selector: 'app-copilot-activity',
  template: '',
})
export class CopilotActivity {
  readonly message = input<unknown>(null);
  readonly agentId = input('');
}

export class CopilotKit {}
