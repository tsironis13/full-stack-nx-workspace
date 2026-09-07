/** Wire types for starting Cart Item workflow on the Mastra server. */

export type CartItemWorkflowStartWire = {
  productId: number;
  hintText?: string;
};

export type CartItemWorkflowSurfaceWire = {
  surfaceId: string;
  messages: unknown[];
};

export type CartItemWorkflowRunWire = {
  status: string;
  result?: CartItemWorkflowSurfaceWire;
};
