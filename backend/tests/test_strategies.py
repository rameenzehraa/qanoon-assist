"""
Strategy Pattern (fee calculation) tests.

Covers:
  - HourlyFeeStrategy: rate × hours
  - FlatFeeStrategy: fixed amount
  - ContingencyFeeStrategy: percentage of claim value
  - Edge cases: zero values, None fields
  - FeeStrategyFactory returns correct instance per type string
  - FeeStrategyFactory raises ValueError for unknown type
  - CaseRepository.calculate_fee() delegates to the lawyer's strategy

Run with:
  python manage.py test tests.test_strategies
"""

from decimal import Decimal
from unittest.mock import MagicMock

from django.test import TestCase

from users.models import User, CitizenProfile, LawyerProfile
from cases.models import CaseRequest, Case
from strategies import (
    HourlyFeeStrategy,
    FlatFeeStrategy,
    ContingencyFeeStrategy,
    FeeStrategyFactory,
)
from repositories import CaseRepository


# ─────────────────────────────────────────────────────────────────────────────
# Helpers — build lightweight mock Case objects without hitting the DB
# ─────────────────────────────────────────────────────────────────────────────

def mock_case(fee_strategy_type, hourly_rate=None, flat_fee=None,
              contingency_percentage=None, estimated_hours=None, claim_value=None):
    """Return a MagicMock that looks enough like a Case for strategy.calculate()."""
    lawyer = MagicMock()
    lawyer.fee_strategy_type = fee_strategy_type
    lawyer.hourly_rate = hourly_rate
    lawyer.flat_fee = flat_fee
    lawyer.contingency_percentage = contingency_percentage

    case_request = MagicMock()
    case_request.lawyer = lawyer

    case = MagicMock()
    case.case_request = case_request
    case.estimated_hours = estimated_hours
    case.claim_value = claim_value
    return case


# ─────────────────────────────────────────────────────────────────────────────
# HourlyFeeStrategy
# ─────────────────────────────────────────────────────────────────────────────

class HourlyFeeStrategyTests(TestCase):
    def setUp(self):
        self.strategy = HourlyFeeStrategy()

    def test_calculates_rate_times_hours(self):
        case = mock_case('hourly', hourly_rate=Decimal('5000'), estimated_hours=Decimal('3'))
        self.assertEqual(self.strategy.calculate(case), Decimal('15000'))

    def test_fractional_hours(self):
        case = mock_case('hourly', hourly_rate=Decimal('1000'), estimated_hours=Decimal('1.5'))
        self.assertEqual(self.strategy.calculate(case), Decimal('1500.0'))

    def test_zero_hours_returns_zero(self):
        case = mock_case('hourly', hourly_rate=Decimal('5000'), estimated_hours=Decimal('0'))
        self.assertEqual(self.strategy.calculate(case), Decimal('0'))

    def test_none_hourly_rate_treated_as_zero(self):
        case = mock_case('hourly', hourly_rate=None, estimated_hours=Decimal('10'))
        self.assertEqual(self.strategy.calculate(case), Decimal('0'))

    def test_none_estimated_hours_treated_as_zero(self):
        case = mock_case('hourly', hourly_rate=Decimal('5000'), estimated_hours=None)
        self.assertEqual(self.strategy.calculate(case), Decimal('0'))


# ─────────────────────────────────────────────────────────────────────────────
# FlatFeeStrategy
# ─────────────────────────────────────────────────────────────────────────────

class FlatFeeStrategyTests(TestCase):
    def setUp(self):
        self.strategy = FlatFeeStrategy()

    def test_returns_flat_fee(self):
        case = mock_case('flat', flat_fee=Decimal('25000'))
        self.assertEqual(self.strategy.calculate(case), Decimal('25000'))

    def test_flat_fee_independent_of_other_fields(self):
        case = mock_case('flat', flat_fee=Decimal('10000'),
                         hourly_rate=Decimal('999'), estimated_hours=Decimal('50'))
        self.assertEqual(self.strategy.calculate(case), Decimal('10000'))

    def test_none_flat_fee_treated_as_zero(self):
        case = mock_case('flat', flat_fee=None)
        self.assertEqual(self.strategy.calculate(case), Decimal('0'))

    def test_zero_flat_fee(self):
        case = mock_case('flat', flat_fee=Decimal('0'))
        self.assertEqual(self.strategy.calculate(case), Decimal('0'))


# ─────────────────────────────────────────────────────────────────────────────
# ContingencyFeeStrategy
# ─────────────────────────────────────────────────────────────────────────────

class ContingencyFeeStrategyTests(TestCase):
    def setUp(self):
        self.strategy = ContingencyFeeStrategy()

    def test_calculates_percentage_of_claim(self):
        case = mock_case('contingency', contingency_percentage=Decimal('20'),
                         claim_value=Decimal('500000'))
        self.assertEqual(self.strategy.calculate(case), Decimal('100000.00'))

    def test_fractional_percentage(self):
        case = mock_case('contingency', contingency_percentage=Decimal('33.33'),
                         claim_value=Decimal('300000'))
        result = self.strategy.calculate(case)
        self.assertAlmostEqual(float(result), 99990.0, places=1)

    def test_none_claim_value_treated_as_zero(self):
        case = mock_case('contingency', contingency_percentage=Decimal('20'),
                         claim_value=None)
        self.assertEqual(self.strategy.calculate(case), Decimal('0'))

    def test_none_percentage_treated_as_zero(self):
        case = mock_case('contingency', contingency_percentage=None,
                         claim_value=Decimal('500000'))
        self.assertEqual(self.strategy.calculate(case), Decimal('0'))

    def test_zero_percentage(self):
        case = mock_case('contingency', contingency_percentage=Decimal('0'),
                         claim_value=Decimal('1000000'))
        self.assertEqual(self.strategy.calculate(case), Decimal('0'))


# ─────────────────────────────────────────────────────────────────────────────
# FeeStrategyFactory
# ─────────────────────────────────────────────────────────────────────────────

class FeeStrategyFactoryTests(TestCase):
    def test_hourly_returns_hourly_instance(self):
        strategy = FeeStrategyFactory.get('hourly')
        self.assertIsInstance(strategy, HourlyFeeStrategy)

    def test_flat_returns_flat_instance(self):
        strategy = FeeStrategyFactory.get('flat')
        self.assertIsInstance(strategy, FlatFeeStrategy)

    def test_contingency_returns_contingency_instance(self):
        strategy = FeeStrategyFactory.get('contingency')
        self.assertIsInstance(strategy, ContingencyFeeStrategy)

    def test_unknown_type_raises_value_error(self):
        with self.assertRaises(ValueError):
            FeeStrategyFactory.get('retainer')

    def test_error_message_names_bad_type(self):
        with self.assertRaises(ValueError) as ctx:
            FeeStrategyFactory.get('magic')
        self.assertIn('magic', str(ctx.exception))

    def test_each_call_returns_new_instance(self):
        s1 = FeeStrategyFactory.get('flat')
        s2 = FeeStrategyFactory.get('flat')
        self.assertIsNot(s1, s2)


# ─────────────────────────────────────────────────────────────────────────────
# CaseRepository.calculate_fee() — integration with DB objects
# ─────────────────────────────────────────────────────────────────────────────

def make_user(username, user_type):
    return User.objects.create_user(
        username=username, password='testpass', user_type=user_type,
        email=f'{username}@test.com',
    )


class CaseRepositoryCalculateFeeTests(TestCase):
    def setUp(self):
        self.repo = CaseRepository()

        citizen_user = make_user('fee_citizen', 'citizen')
        self.citizen = CitizenProfile.objects.create(user=citizen_user, cnic='fee_citizen123')

        lawyer_user = make_user('fee_lawyer', 'lawyer')
        self.lawyer = LawyerProfile.objects.create(
            user=lawyer_user,
            bar_council_number='BC-FEE-001',
            experience_years=5,
            consultation_fee='5000.00',
            city='Karachi',
            cnic='12345-1234567-1',
            fee_strategy_type='flat',
            flat_fee=Decimal('30000'),
        )

        self.case_request = CaseRequest.objects.create(
            requester=self.citizen,
            lawyer=self.lawyer,
            case_title='Fee Test Case',
            case_type='Civil',
            description='Testing fee calculation.',
            urgency='medium',
            status='in_progress',
        )

        self.case = Case.objects.create(
            citizen=self.citizen,
            lawyer=self.lawyer,
            case_request=self.case_request,
            title='Fee Test Case',
            description='Testing fee calculation.',
            status='active',
        )

    def test_flat_strategy_via_repository(self):
        fee = self.repo.calculate_fee(self.case)
        self.assertEqual(fee, Decimal('30000'))

    def test_hourly_strategy_via_repository(self):
        self.lawyer.fee_strategy_type = 'hourly'
        self.lawyer.hourly_rate = Decimal('2000')
        self.lawyer.save(update_fields=['fee_strategy_type', 'hourly_rate'])
        self.case.estimated_hours = Decimal('4')

        fee = self.repo.calculate_fee(self.case)
        self.assertEqual(fee, Decimal('8000'))

    def test_contingency_strategy_via_repository(self):
        self.lawyer.fee_strategy_type = 'contingency'
        self.lawyer.contingency_percentage = Decimal('15')
        self.lawyer.save(update_fields=['fee_strategy_type', 'contingency_percentage'])
        self.case.claim_value = Decimal('200000')

        fee = self.repo.calculate_fee(self.case)
        self.assertEqual(fee, Decimal('30000.00'))

    def test_unknown_strategy_type_raises_value_error(self):
        self.lawyer.fee_strategy_type = 'retainer'
        self.lawyer.save(update_fields=['fee_strategy_type'])
        with self.assertRaises(ValueError):
            self.repo.calculate_fee(self.case)
