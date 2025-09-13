"""
web3 URL configuration.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WalletViewSet, BlockchainTransactionViewSet, SmartContractViewSet,
    TokenViewSet, WalletBalanceViewSet, DeFiProtocolViewSet,
    TransactionView, TokenTransferView, Web3StatusView,
    MessageSigningView, SignatureVerificationView, WalletConnectView,
    DecentralizedIdentityViewSet, OnChainAnchorViewSet, SmartContractModuleViewSet,
    DAOGovernanceViewSet, TokenizedRewardViewSet, DecentralizedStorageViewSet,
    BlockchainAuditLogViewSet, Web3DashboardView
)

router = DefaultRouter()
# Basic Web3 endpoints
router.register(r'wallets', WalletViewSet)
router.register(r'transactions', BlockchainTransactionViewSet)
router.register(r'contracts', SmartContractViewSet)
router.register(r'tokens', TokenViewSet)
router.register(r'balances', WalletBalanceViewSet)
router.register(r'protocols', DeFiProtocolViewSet)

# Core Web3 endpoints
router.register(r'dids', DecentralizedIdentityViewSet)
router.register(r'anchors', OnChainAnchorViewSet)
router.register(r'smart-contract-modules', SmartContractModuleViewSet)
router.register(r'governance', DAOGovernanceViewSet)
router.register(r'rewards', TokenizedRewardViewSet)
router.register(r'storage', DecentralizedStorageViewSet)
router.register(r'audit-logs', BlockchainAuditLogViewSet)

urlpatterns = [
    # API routes
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('api/auth/message/', MessageSigningView.as_view(), name='web3-message-signing'),
    path('api/auth/verify/', SignatureVerificationView.as_view(), name='web3-signature-verification'),
    
    # Transaction endpoints
    path('api/transactions/create/', TransactionView.as_view(), name='web3-transaction-create'),
    path('api/transfers/token/', TokenTransferView.as_view(), name='web3-token-transfer'),
    
    # Status and connection endpoints
    path('api/status/', Web3StatusView.as_view(), name='web3-status'),
    path('api/walletconnect/', WalletConnectView.as_view(), name='web3-walletconnect'),
    
    # Web3 Dashboard
    path('api/dashboard/', Web3DashboardView.as_view(), name='web3-dashboard'),
]
