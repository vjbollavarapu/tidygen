"""
Web3 and blockchain integration views.
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.conf import settings
from django.utils import timezone
from web3 import Web3
import json
import hashlib
import hmac
from eth_account.messages import encode_defunct
from eth_account import Account

from .models import (
    Wallet, BlockchainTransaction, SmartContract, Token,
    WalletBalance, DeFiProtocol
)
from .serializers import (
    WalletSerializer, WalletCreateSerializer, BlockchainTransactionSerializer,
    SmartContractSerializer, TokenSerializer, WalletBalanceSerializer,
    DeFiProtocolSerializer, WalletVerificationSerializer,
    TransactionRequestSerializer, TokenTransferSerializer,
    MessageSigningSerializer, SignatureVerificationSerializer
)


class WalletViewSet(viewsets.ModelViewSet):
    """ViewSet for wallet management."""
    queryset = Wallet.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['wallet_type', 'is_primary', 'is_verified']
    search_fields = ['address']
    ordering_fields = ['created_at', 'last_used']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter wallets by user."""
        return Wallet.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return WalletCreateSerializer
        return WalletSerializer
    
    @action(detail=False, methods=['get'])
    def my_wallets(self, request):
        """Get current user's wallets."""
        wallets = self.get_queryset()
        serializer = self.get_serializer(wallets, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify wallet ownership."""
        wallet = self.get_object()
        serializer = WalletVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            # TODO: Implement signature verification
            # This would involve verifying the signature against the message and address
            wallet.is_verified = True
            wallet.verification_signature = serializer.validated_data['signature']
            wallet.save()
            
            return Response({'message': 'Wallet verified successfully.'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """Set wallet as primary."""
        wallet = self.get_object()
        
        # Unset other primary wallets
        Wallet.objects.filter(user=request.user, is_primary=True).update(is_primary=False)
        
        # Set this wallet as primary
        wallet.is_primary = True
        wallet.save()
        
        return Response({'message': 'Primary wallet updated successfully.'})


class BlockchainTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for blockchain transactions."""
    queryset = BlockchainTransaction.objects.all()
    serializer_class = BlockchainTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['transaction_type', 'status', 'wallet']
    search_fields = ['transaction_hash', 'from_address', 'to_address']
    ordering_fields = ['created_at', 'block_number', 'value']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter transactions by user."""
        return BlockchainTransaction.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending transactions."""
        pending_transactions = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(pending_transactions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent transactions."""
        recent_transactions = self.get_queryset()[:20]
        serializer = self.get_serializer(recent_transactions, many=True)
        return Response(serializer.data)


class SmartContractViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for smart contracts."""
    queryset = SmartContract.objects.all()
    serializer_class = SmartContractSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['contract_type', 'is_verified', 'is_active']
    search_fields = ['name', 'address']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def my_contracts(self, request):
        """Get contracts deployed by current user."""
        contracts = self.get_queryset().filter(deployer=request.user)
        serializer = self.get_serializer(contracts, many=True)
        return Response(serializer.data)


class TokenViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for tokens."""
    queryset = Token.objects.all()
    serializer_class = TokenSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['contract', 'decimals']
    search_fields = ['name', 'symbol', 'token_id']
    ordering_fields = ['name', 'symbol', 'market_cap']
    ordering = ['symbol']
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular tokens."""
        popular_tokens = self.get_queryset().filter(
            market_cap__isnull=False
        ).order_by('-market_cap')[:20]
        serializer = self.get_serializer(popular_tokens, many=True)
        return Response(serializer.data)


class WalletBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for wallet balances."""
    queryset = WalletBalance.objects.all()
    serializer_class = WalletBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['wallet', 'token']
    ordering_fields = ['balance', 'last_updated']
    ordering = ['-balance']
    
    def get_queryset(self):
        """Filter balances by user's wallets."""
        user_wallets = Wallet.objects.filter(user=self.request.user)
        return WalletBalance.objects.filter(wallet__in=user_wallets)
    
    @action(detail=False, methods=['get'])
    def my_balances(self, request):
        """Get current user's wallet balances."""
        balances = self.get_queryset()
        serializer = self.get_serializer(balances, many=True)
        return Response(serializer.data)


class DeFiProtocolViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for DeFi protocols."""
    queryset = DeFiProtocol.objects.filter(is_active=True)
    serializer_class = DeFiProtocolSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['protocol_type', 'risk_level']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'apy']
    ordering = ['name']


class TransactionView(APIView):
    """View for creating blockchain transactions."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Create a new transaction."""
        serializer = TransactionRequestSerializer(data=request.data)
        if serializer.is_valid():
            # TODO: Implement transaction creation
            # This would involve creating a transaction object and returning it
            # for the frontend to sign and broadcast
            
            transaction_data = {
                'to': serializer.validated_data['to_address'],
                'value': int(serializer.validated_data['value'] * 10**18),  # Convert to wei
                'gas': serializer.validated_data.get('gas_limit', 21000),
                'gasPrice': serializer.validated_data.get('gas_price', 20000000000),  # 20 gwei
                'data': serializer.validated_data.get('data', '0x'),
            }
            
            return Response({
                'message': 'Transaction created successfully.',
                'transaction': transaction_data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TokenTransferView(APIView):
    """View for token transfers."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Create a token transfer transaction."""
        serializer = TokenTransferSerializer(data=request.data)
        if serializer.is_valid():
            # TODO: Implement token transfer
            # This would involve creating a contract call transaction
            
            transfer_data = {
                'contract_address': serializer.validated_data['token_address'],
                'function': 'transfer',
                'parameters': [
                    serializer.validated_data['to_address'],
                    int(serializer.validated_data['amount'] * 10**18)  # Convert to token units
                ]
            }
            
            return Response({
                'message': 'Token transfer transaction created successfully.',
                'transfer': transfer_data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Web3StatusView(APIView):
    """View for Web3 connection status."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get Web3 connection status."""
        # TODO: Implement actual Web3 connection check
        status_data = {
            'connected': True,
            'network': 'mainnet',
            'chain_id': 1,
            'block_number': 18000000,  # Example
            'gas_price': '20000000000',  # 20 gwei
        }
        
        return Response(status_data)


class MessageSigningView(APIView):
    """View for creating authentication messages."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Create a message for wallet signing."""
        serializer = MessageSigningSerializer(data=request.data)
        
        if serializer.is_valid():
            address = serializer.validated_data['address']
            timestamp = int(timezone.now().timestamp())
            
            # Create authentication message
            message_prefix = getattr(settings, 'WEB3_MESSAGE_PREFIX', 'iNEAT ERP Login')
            message = f"{message_prefix}\n\nAddress: {address}\nTimestamp: {timestamp}"
            
            # Create a unique nonce for this request
            nonce = hashlib.sha256(
                f"{address}{timestamp}{request.user.id}".encode()
            ).hexdigest()[:16]
            
            return Response({
                'message': message,
                'address': address,
                'timestamp': timestamp,
                'nonce': nonce,
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SignatureVerificationView(APIView):
    """View for verifying wallet signatures."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Verify a wallet signature."""
        serializer = SignatureVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            address = serializer.validated_data['address']
            signature = serializer.validated_data['signature']
            message = serializer.validated_data['message']
            
            try:
                # Verify the signature
                message_hash = encode_defunct(text=message)
                recovered_address = Account.recover_message(message_hash, signature=signature)
                
                # Check if the recovered address matches the provided address
                if recovered_address.lower() != address.lower():
                    return Response({
                        'verified': False,
                        'error': 'Signature verification failed'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Get or create wallet
                wallet, created = Wallet.objects.get_or_create(
                    user=request.user,
                    address=address,
                    defaults={
                        'wallet_type': 'metamask',  # Default type
                        'is_verified': True,
                        'verification_signature': signature,
                        'last_used': timezone.now(),
                    }
                )
                
                if not created:
                    # Update existing wallet
                    wallet.is_verified = True
                    wallet.verification_signature = signature
                    wallet.last_used = timezone.now()
                    wallet.save()
                
                # Generate JWT token for the user
                from rest_framework_simplejwt.tokens import RefreshToken
                refresh = RefreshToken.for_user(request.user)
                
                return Response({
                    'verified': True,
                    'wallet': {
                        'address': wallet.address,
                        'wallet_type': wallet.wallet_type,
                        'is_verified': wallet.is_verified,
                        'is_primary': wallet.is_primary,
                    },
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                })
                
            except Exception as e:
                return Response({
                    'verified': False,
                    'error': f'Signature verification failed: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WalletConnectView(APIView):
    """View for WalletConnect integration."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Handle WalletConnect connection."""
        # TODO: Implement WalletConnect session management
        # This would involve storing WalletConnect session data
        # and managing the connection lifecycle
        
        return Response({
            'message': 'WalletConnect integration coming soon',
            'status': 'pending'
        })
    
    def delete(self, request):
        """Disconnect WalletConnect session."""
        # TODO: Implement WalletConnect disconnection
        return Response({
            'message': 'WalletConnect session disconnected'
        })
