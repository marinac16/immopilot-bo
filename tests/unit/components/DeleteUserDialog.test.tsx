import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteUserDialog } from "@/app/(dashboard)/immopilot-bo/users/[id]/DeleteUserDialog";

const sampleUser = {
  firstname: "Marina",
  lastname: "Dupont",
  email: "marina@example.com",
};

function renderAndOpen(props: Partial<{
  user: typeof sampleUser;
  action: () => Promise<void>;
}> = {}) {
  const action = props.action ?? vi.fn().mockResolvedValue(undefined);
  render(<DeleteUserDialog user={props.user ?? sampleUser} action={action} />);
  fireEvent.click(screen.getByRole("button", { name: /supprimer l'utilisateur/i }));
  return { action };
}

describe("DeleteUserDialog", () => {
  it("displays the user identity prominently when opened", () => {
    renderAndOpen();
    expect(screen.getByText("Marina Dupont")).toBeInTheDocument();
    expect(screen.getByText("marina@example.com")).toBeInTheDocument();
  });

  it("keeps the confirm button disabled when the email field is empty", () => {
    renderAndOpen();
    const confirmBtn = screen.getByRole("button", { name: /supprimer définitivement/i });
    expect(confirmBtn).toBeDisabled();
  });

  it("keeps the confirm button disabled when the typed email does not match", () => {
    renderAndOpen();
    fireEvent.change(screen.getByLabelText(/tapez l'email/i), {
      target: { value: "wrong@example.com" },
    });
    expect(screen.getByRole("button", { name: /supprimer définitivement/i })).toBeDisabled();
  });

  it("enables the confirm button only when the typed email matches exactly", () => {
    renderAndOpen();
    fireEvent.change(screen.getByLabelText(/tapez l'email/i), {
      target: { value: "marina@example.com" },
    });
    expect(screen.getByRole("button", { name: /supprimer définitivement/i })).toBeEnabled();
  });

  it("ignores case and surrounding whitespace when comparing emails", () => {
    renderAndOpen();
    fireEvent.change(screen.getByLabelText(/tapez l'email/i), {
      target: { value: "  MARINA@example.com  " },
    });
    expect(screen.getByRole("button", { name: /supprimer définitivement/i })).toBeEnabled();
  });

  it("calls the action when submitting with a matching email", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    renderAndOpen({ action });
    fireEvent.change(screen.getByLabelText(/tapez l'email/i), {
      target: { value: "marina@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /supprimer définitivement/i }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
  });

  it("does not call the action if the user submits while the email is invalid", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    renderAndOpen({ action });
    fireEvent.change(screen.getByLabelText(/tapez l'email/i), {
      target: { value: "wrong@example.com" },
    });
    const form = screen.getByLabelText(/tapez l'email/i).closest("form");
    if (!form) throw new Error("form not found");
    fireEvent.submit(form);
    await new Promise((r) => setTimeout(r, 0));
    expect(action).not.toHaveBeenCalled();
  });
});
