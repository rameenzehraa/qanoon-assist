from abc import ABC, abstractmethod
from decimal import Decimal


class FeeStrategy(ABC):
    """Abstract base — all concrete strategies must implement calculate()."""

    @abstractmethod
    def calculate(self, case) -> Decimal:
        """
        Return the calculated fee for `case`.
        `case` is a cases.models.Case instance whose .case_request.lawyer
        carries the fee parameters.
        """


class HourlyFeeStrategy(FeeStrategy):
    """Fee = lawyer's hourly_rate × case.estimated_hours."""

    def calculate(self, case) -> Decimal:
        lawyer = case.case_request.lawyer
        rate = lawyer.hourly_rate or Decimal('0')
        hours = getattr(case, 'estimated_hours', None) or Decimal('0')
        return Decimal(rate) * Decimal(hours)


class FlatFeeStrategy(FeeStrategy):
    """Fee = lawyer's flat_fee (fixed amount, independent of case details)."""

    def calculate(self, case) -> Decimal:
        lawyer = case.case_request.lawyer
        return Decimal(lawyer.flat_fee or '0')


class ContingencyFeeStrategy(FeeStrategy):
    """Fee = (lawyer's contingency_percentage / 100) × case.claim_value."""

    def calculate(self, case) -> Decimal:
        lawyer = case.case_request.lawyer
        percentage = Decimal(lawyer.contingency_percentage or '0')
        claim_value = Decimal(getattr(case, 'claim_value', None) or '0')
        return (percentage / Decimal('100')) * claim_value


class FeeStrategyFactory:
    _strategies = {
        'hourly': HourlyFeeStrategy,
        'flat': FlatFeeStrategy,
        'contingency': ContingencyFeeStrategy,
    }

    @classmethod
    def get(cls, strategy_type: str) -> FeeStrategy:
        """Return a strategy instance for the given type string."""
        klass = cls._strategies.get(strategy_type)
        if klass is None:
            valid = ', '.join(f"'{k}'" for k in cls._strategies)
            raise ValueError(
                f"Unknown fee strategy '{strategy_type}'. Must be one of: {valid}."
            )
        return klass()
