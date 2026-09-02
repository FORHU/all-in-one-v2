import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateTimeField } from "@/shared/components/DateTimeField";

const meta = {
  title: "Shared/DateTimeField",
  component: DateTimeField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Themed replacement for `<input type="datetime-local">`. Trigger + portalled calendar/time panel, keyboard-navigable grid, `value`/`onChange` in ISO strings (`""` when empty).',
      },
    },
  },
} satisfies Meta<typeof DateTimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(props: Partial<Parameters<typeof DateTimeField>[0]>) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <div className="shop-theme w-72 p-6">
      <DateTimeField {...props} value={value} onChange={setValue} />
      <p className="mt-3 text-xs text-[var(--shop-text-muted)]">
        value: <code>{value || "(empty)"}</code>
      </p>
    </div>
  );
}

// Stories drive their own state through <Controlled>; `args` is only here to
// satisfy the Meta type (DateTimeField has required props).
const noopArgs = { value: "", onChange: () => {} };

export const Empty: Story = {
  args: noopArgs,
  render: () => <Controlled placeholder="Pick a date & time" />,
};

export const Prefilled: Story = {
  args: noopArgs,
  render: () => (
    <Controlled value={new Date("2026-09-24T09:00:00").toISOString()} />
  ),
};

export const WithMinToday: Story = {
  args: noopArgs,
  name: "Min = today (no past dates)",
  render: () => <Controlled min={new Date().toISOString()} />,
};

export const DateOnly: Story = {
  args: noopArgs,
  name: "Date only (no time row)",
  render: () => <Controlled mode="date" clearable={false} value="2026-09-24" />,
};

export const Disabled: Story = {
  args: noopArgs,
  render: () => (
    <Controlled
      value={new Date("2026-09-24T09:00:00").toISOString()}
      disabled
    />
  ),
};
