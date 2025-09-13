"""
Web3 and blockchain integration filters.
"""
import django_filters
from django.db.models import Q
from datetime import datetime, timedelta

from .models import (
    Wallet, BlockchainTransaction, SmartContract, Token,
    WalletBalance, DeFiProtocol, DecentralizedIdentity, OnChainAnchor,
    SmartContractModule, DAOGovernance, GovernanceVote, TokenizedReward,
    DecentralizedStorage, BlockchainAuditLog
)


class WalletFilter(django_filters.FilterSet):
    """Filter for Wallet model."""
    wallet_type = django_filters.ChoiceFilter(choices=Wallet.WALLET_TYPES)
    is_primary = django_filters.BooleanFilter()
    is_verified = django_filters.BooleanFilter()
    last_used_after = django_filters.DateTimeFilter(field_name='last_used', lookup_expr='gte')
    last_used_before = django_filters.DateTimeFilter(field_name='last_used', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = Wallet
        fields = ['wallet_type', 'is_primary', 'is_verified']


class BlockchainTransactionFilter(django_filters.FilterSet):
    """Filter for BlockchainTransaction model."""
    transaction_type = django_filters.ChoiceFilter(choices=BlockchainTransaction.TRANSACTION_TYPES)
    status = django_filters.ChoiceFilter(choices=BlockchainTransaction.STATUS_CHOICES)
    wallet = django_filters.ModelChoiceFilter(queryset=Wallet.objects.all())
    value_min = django_filters.NumberFilter(field_name='value', lookup_expr='gte')
    value_max = django_filters.NumberFilter(field_name='value', lookup_expr='lte')
    block_number_min = django_filters.NumberFilter(field_name='block_number', lookup_expr='gte')
    block_number_max = django_filters.NumberFilter(field_name='block_number', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = BlockchainTransaction
        fields = ['transaction_type', 'status', 'wallet']


class SmartContractFilter(django_filters.FilterSet):
    """Filter for SmartContract model."""
    contract_type = django_filters.ChoiceFilter(choices=SmartContract.CONTRACT_TYPES)
    is_verified = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()
    deployer = django_filters.ModelChoiceFilter(queryset=SmartContract.objects.values_list('deployer', flat=True).distinct())
    total_supply_min = django_filters.NumberFilter(field_name='total_supply', lookup_expr='gte')
    total_supply_max = django_filters.NumberFilter(field_name='total_supply', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = SmartContract
        fields = ['contract_type', 'is_verified', 'is_active']


class TokenFilter(django_filters.FilterSet):
    """Filter for Token model."""
    contract = django_filters.ModelChoiceFilter(queryset=SmartContract.objects.all())
    decimals = django_filters.NumberFilter()
    price_usd_min = django_filters.NumberFilter(field_name='price_usd', lookup_expr='gte')
    price_usd_max = django_filters.NumberFilter(field_name='price_usd', lookup_expr='lte')
    market_cap_min = django_filters.NumberFilter(field_name='market_cap', lookup_expr='gte')
    market_cap_max = django_filters.NumberFilter(field_name='market_cap', lookup_expr='lte')
    
    class Meta:
        model = Token
        fields = ['contract', 'decimals']


class WalletBalanceFilter(django_filters.FilterSet):
    """Filter for WalletBalance model."""
    wallet = django_filters.ModelChoiceFilter(queryset=Wallet.objects.all())
    token = django_filters.ModelChoiceFilter(queryset=Token.objects.all())
    balance_min = django_filters.NumberFilter(field_name='balance', lookup_expr='gte')
    balance_max = django_filters.NumberFilter(field_name='balance', lookup_expr='lte')
    last_updated_after = django_filters.DateTimeFilter(field_name='last_updated', lookup_expr='gte')
    last_updated_before = django_filters.DateTimeFilter(field_name='last_updated', lookup_expr='lte')
    
    class Meta:
        model = WalletBalance
        fields = ['wallet', 'token']


class DeFiProtocolFilter(django_filters.FilterSet):
    """Filter for DeFiProtocol model."""
    protocol_type = django_filters.ChoiceFilter(choices=DeFiProtocol.PROTOCOL_TYPES)
    risk_level = django_filters.ChoiceFilter(choices=DeFiProtocol._meta.get_field('risk_level').choices)
    is_active = django_filters.BooleanFilter()
    apy_min = django_filters.NumberFilter(field_name='apy', lookup_expr='gte')
    apy_max = django_filters.NumberFilter(field_name='apy', lookup_expr='lte')
    
    class Meta:
        model = DeFiProtocol
        fields = ['protocol_type', 'risk_level', 'is_active']


# ==================== CORE WEB3 FILTERS ====================

class DecentralizedIdentityFilter(django_filters.FilterSet):
    """Filter for DecentralizedIdentity model."""
    did_method = django_filters.ChoiceFilter(choices=DecentralizedIdentity.DID_METHODS)
    status = django_filters.ChoiceFilter(choices=DecentralizedIdentity.STATUS_CHOICES)
    is_verified = django_filters.BooleanFilter()
    is_expired = django_filters.BooleanFilter(method='filter_expired')
    expires_after = django_filters.DateTimeFilter(field_name='expires_at', lookup_expr='gte')
    expires_before = django_filters.DateTimeFilter(field_name='expires_at', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = DecentralizedIdentity
        fields = ['did_method', 'status', 'is_verified']
    
    def filter_expired(self, queryset, name, value):
        """Filter expired DIDs."""
        from django.utils import timezone
        now = timezone.now()
        if value:
            return queryset.filter(expires_at__lt=now)
        else:
            return queryset.filter(Q(expires_at__isnull=True) | Q(expires_at__gte=now))


class OnChainAnchorFilter(django_filters.FilterSet):
    """Filter for OnChainAnchor model."""
    anchor_type = django_filters.ChoiceFilter(choices=OnChainAnchor.ANCHOR_TYPES)
    status = django_filters.ChoiceFilter(choices=OnChainAnchor.STATUS_CHOICES)
    blockchain_network = django_filters.CharFilter(lookup_expr='icontains')
    data_type = django_filters.CharFilter(lookup_expr='icontains')
    block_number_min = django_filters.NumberFilter(field_name='block_number', lookup_expr='gte')
    block_number_max = django_filters.NumberFilter(field_name='block_number', lookup_expr='lte')
    gas_used_min = django_filters.NumberFilter(field_name='gas_used', lookup_expr='gte')
    gas_used_max = django_filters.NumberFilter(field_name='gas_used', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = OnChainAnchor
        fields = ['anchor_type', 'status', 'blockchain_network', 'data_type']


class SmartContractModuleFilter(django_filters.FilterSet):
    """Filter for SmartContractModule model."""
    module_type = django_filters.ChoiceFilter(choices=SmartContractModule.MODULE_TYPES)
    status = django_filters.ChoiceFilter(choices=SmartContractModule.STATUS_CHOICES)
    contract = django_filters.ModelChoiceFilter(queryset=SmartContract.objects.all())
    version = django_filters.CharFilter(lookup_expr='icontains')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = SmartContractModule
        fields = ['module_type', 'status', 'contract']


class DAOGovernanceFilter(django_filters.FilterSet):
    """Filter for DAOGovernance model."""
    governance_type = django_filters.ChoiceFilter(choices=DAOGovernance.GOVERNANCE_TYPES)
    status = django_filters.ChoiceFilter(choices=DAOGovernance.STATUS_CHOICES)
    proposer = django_filters.ModelChoiceFilter(queryset=DAOGovernance.objects.values_list('proposer', flat=True).distinct())
    voting_power_required_min = django_filters.NumberFilter(field_name='voting_power_required', lookup_expr='gte')
    voting_power_required_max = django_filters.NumberFilter(field_name='voting_power_required', lookup_expr='lte')
    votes_for_min = django_filters.NumberFilter(field_name='votes_for', lookup_expr='gte')
    votes_for_max = django_filters.NumberFilter(field_name='votes_for', lookup_expr='lte')
    votes_against_min = django_filters.NumberFilter(field_name='votes_against', lookup_expr='gte')
    votes_against_max = django_filters.NumberFilter(field_name='votes_against', lookup_expr='lte')
    voting_active = django_filters.BooleanFilter(method='filter_voting_active')
    voting_start_after = django_filters.DateTimeFilter(field_name='voting_start', lookup_expr='gte')
    voting_start_before = django_filters.DateTimeFilter(field_name='voting_start', lookup_expr='lte')
    voting_end_after = django_filters.DateTimeFilter(field_name='voting_end', lookup_expr='gte')
    voting_end_before = django_filters.DateTimeFilter(field_name='voting_end', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = DAOGovernance
        fields = ['governance_type', 'status', 'proposer']
    
    def filter_voting_active(self, queryset, name, value):
        """Filter active voting proposals."""
        from django.utils import timezone
        now = timezone.now()
        if value:
            return queryset.filter(
                status='active',
                voting_start__lte=now,
                voting_end__gte=now
            )
        else:
            return queryset.exclude(
                status='active',
                voting_start__lte=now,
                voting_end__gte=now
            )


class GovernanceVoteFilter(django_filters.FilterSet):
    """Filter for GovernanceVote model."""
    governance = django_filters.ModelChoiceFilter(queryset=DAOGovernance.objects.all())
    voter = django_filters.ModelChoiceFilter(queryset=GovernanceVote.objects.values_list('voter', flat=True).distinct())
    vote_choice = django_filters.ChoiceFilter(choices=GovernanceVote.VOTE_CHOICES)
    voting_power_min = django_filters.NumberFilter(field_name='voting_power', lookup_expr='gte')
    voting_power_max = django_filters.NumberFilter(field_name='voting_power', lookup_expr='lte')
    block_number_min = django_filters.NumberFilter(field_name='block_number', lookup_expr='gte')
    block_number_max = django_filters.NumberFilter(field_name='block_number', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = GovernanceVote
        fields = ['governance', 'voter', 'vote_choice']


class TokenizedRewardFilter(django_filters.FilterSet):
    """Filter for TokenizedReward model."""
    reward_type = django_filters.ChoiceFilter(choices=TokenizedReward.REWARD_TYPES)
    status = django_filters.ChoiceFilter(choices=TokenizedReward.STATUS_CHOICES)
    recipient = django_filters.ModelChoiceFilter(queryset=TokenizedReward.objects.values_list('recipient', flat=True).distinct())
    evaluator = django_filters.ModelChoiceFilter(queryset=TokenizedReward.objects.values_list('evaluator', flat=True).distinct())
    token_contract = django_filters.ModelChoiceFilter(queryset=SmartContract.objects.all())
    token_amount_min = django_filters.NumberFilter(field_name='token_amount', lookup_expr='gte')
    token_amount_max = django_filters.NumberFilter(field_name='token_amount', lookup_expr='lte')
    evaluation_score_min = django_filters.NumberFilter(field_name='evaluation_score', lookup_expr='gte')
    evaluation_score_max = django_filters.NumberFilter(field_name='evaluation_score', lookup_expr='lte')
    paid_after = django_filters.DateTimeFilter(field_name='paid_at', lookup_expr='gte')
    paid_before = django_filters.DateTimeFilter(field_name='paid_at', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = TokenizedReward
        fields = ['reward_type', 'status', 'recipient', 'evaluator', 'token_contract']


class DecentralizedStorageFilter(django_filters.FilterSet):
    """Filter for DecentralizedStorage model."""
    storage_type = django_filters.ChoiceFilter(choices=DecentralizedStorage.STORAGE_TYPES)
    status = django_filters.ChoiceFilter(choices=DecentralizedStorage.STATUS_CHOICES)
    pin_status = django_filters.BooleanFilter()
    file_size_min = django_filters.NumberFilter(field_name='file_size', lookup_expr='gte')
    file_size_max = django_filters.NumberFilter(field_name='file_size', lookup_expr='lte')
    content_type = django_filters.CharFilter(lookup_expr='icontains')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = DecentralizedStorage
        fields = ['storage_type', 'status', 'pin_status']


class BlockchainAuditLogFilter(django_filters.FilterSet):
    """Filter for BlockchainAuditLog model."""
    log_type = django_filters.ChoiceFilter(choices=BlockchainAuditLog.LOG_TYPES)
    severity = django_filters.ChoiceFilter(choices=BlockchainAuditLog.SEVERITY_CHOICES)
    user = django_filters.ModelChoiceFilter(queryset=BlockchainAuditLog.objects.values_list('user', flat=True).distinct())
    is_anchored = django_filters.BooleanFilter()
    block_number_min = django_filters.NumberFilter(field_name='block_number', lookup_expr='gte')
    block_number_max = django_filters.NumberFilter(field_name='block_number', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = BlockchainAuditLog
        fields = ['log_type', 'severity', 'user', 'is_anchored']


# ==================== ADVANCED FILTERS ====================

class Web3AnalyticsFilter(django_filters.FilterSet):
    """Advanced filter for Web3 analytics."""
    date_range = django_filters.ChoiceFilter(
        choices=[
            ('today', 'Today'),
            ('yesterday', 'Yesterday'),
            ('this_week', 'This Week'),
            ('last_week', 'Last Week'),
            ('this_month', 'This Month'),
            ('last_month', 'Last Month'),
            ('this_quarter', 'This Quarter'),
            ('last_quarter', 'Last Quarter'),
            ('this_year', 'This Year'),
            ('last_year', 'Last Year'),
            ('custom', 'Custom Range'),
        ],
        method='filter_date_range'
    )
    start_date = django_filters.DateTimeFilter()
    end_date = django_filters.DateTimeFilter()
    
    def filter_date_range(self, queryset, name, value):
        """Filter by date range."""
        from django.utils import timezone
        now = timezone.now()
        
        if value == 'today':
            return queryset.filter(created__date=now.date())
        elif value == 'yesterday':
            yesterday = now.date() - timedelta(days=1)
            return queryset.filter(created__date=yesterday)
        elif value == 'this_week':
            start_of_week = now.date() - timedelta(days=now.weekday())
            return queryset.filter(created__date__gte=start_of_week)
        elif value == 'last_week':
            start_of_last_week = now.date() - timedelta(days=now.weekday() + 7)
            end_of_last_week = start_of_last_week + timedelta(days=6)
            return queryset.filter(created__date__range=[start_of_last_week, end_of_last_week])
        elif value == 'this_month':
            return queryset.filter(created__year=now.year, created__month=now.month)
        elif value == 'last_month':
            last_month = now.month - 1 if now.month > 1 else 12
            last_year = now.year if now.month > 1 else now.year - 1
            return queryset.filter(created__year=last_year, created__month=last_month)
        elif value == 'this_quarter':
            quarter = (now.month - 1) // 3 + 1
            start_month = (quarter - 1) * 3 + 1
            return queryset.filter(created__year=now.year, created__month__gte=start_month, created__month__lt=start_month + 3)
        elif value == 'last_quarter':
            quarter = (now.month - 1) // 3 + 1
            last_quarter = quarter - 1 if quarter > 1 else 4
            last_year = now.year if quarter > 1 else now.year - 1
            start_month = (last_quarter - 1) * 3 + 1
            return queryset.filter(created__year=last_year, created__month__gte=start_month, created__month__lt=start_month + 3)
        elif value == 'this_year':
            return queryset.filter(created__year=now.year)
        elif value == 'last_year':
            return queryset.filter(created__year=now.year - 1)
        elif value == 'custom':
            start_date = self.data.get('start_date')
            end_date = self.data.get('end_date')
            if start_date and end_date:
                return queryset.filter(created__range=[start_date, end_date])
        
        return queryset
