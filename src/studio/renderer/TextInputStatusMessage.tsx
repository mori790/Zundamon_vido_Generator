import type {TextInputValidationResult} from '../shared/text-input-draft';

type Props = {
  validationResult: TextInputValidationResult | null;
  errorMessage: string | null;
};

export function TextInputStatusMessage({validationResult, errorMessage}: Props): JSX.Element | null {
  if (validationResult && !validationResult.ok) {
    return (
      <p className="error-banner" data-testid="text-input-status-message" role="alert">
        {validationResult.message}
      </p>
    );
  }
  if (errorMessage) {
    return (
      <p className="error-banner" data-testid="text-input-status-message" role="alert">
        {errorMessage}
      </p>
    );
  }
  return null;
}
