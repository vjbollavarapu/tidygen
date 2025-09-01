"""
Web3 and blockchain integration serializers.
"""
from rest_framework import serializers
from .models import (
    Wallet, BlockchainTransaction, SmartContract, Token,
    WalletBalance, DeFiProtocol
)


class WalletSerializer(serializers.ModelSerializer):
    """Serializer for wallet model."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Wallet
        fields = [
            'id', 'user', 'user_name', 'address', 'wallet_type',
            'is_primary', 'is_verified', 'last_used', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'last_used']


class WalletCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating wallets."""
    
    class Meta:
        model = Wallet
        fields = ['address', 'wallet_type', 'is_primary']
    
    def create(self, validated_data):
        """Create wallet and set as primary if specified."""
        user = self.context['request'].user
        wallet = Wallet.objects.create(user=user, **validated_data)
        
        # If this is set as primary, unset other primary wallets
        if wallet.is_primary:
            Wallet.objects.filter(user=user, is_primary=True).exclude(id=wallet.id).update(is_primary=False)
        
        return wallet


class BlockchainTransactionSerializer(serializers.ModelSerializer):
    """Serializer for blockchain transactions."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    wallet_address = serializers.CharField(source='wallet.address', read_only=True)
    
    class Meta:
        model = BlockchainTransaction
        fields = [
            'id', 'user', 'user_name', 'wallet', 'wallet_address',
            'transaction_hash', 'transaction_type', 'status',
            'from_address', 'to_address', 'value', 'gas_used', 'gas_price',
            'block_number', 'block_hash', 'contract_address',
            'token_address', 'token_symbol', 'token_decimals',
            'description', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SmartContractSerializer(serializers.ModelSerializer):
    """Serializer for smart contracts."""
    deployer_name = serializers.CharField(source='deployer.get_full_name', read_only=True)
    
    class Meta:
        model = SmartContract
        fields = [
            'id', 'name', 'contract_type', 'address', 'abi', 'bytecode',
            'source_code', 'deployer', 'deployer_name', 'deployment_transaction',
            'deployment_block', 'is_verified', 'is_active', 'total_supply',
            'description', 'website', 'documentation', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TokenSerializer(serializers.ModelSerializer):
    """Serializer for tokens."""
    contract_name = serializers.CharField(source='contract.name', read_only=True)
    contract_address = serializers.CharField(source='contract.address', read_only=True)
    
    class Meta:
        model = Token
        fields = [
            'id', 'contract', 'contract_name', 'contract_address',
            'token_id', 'symbol', 'name', 'decimals', 'total_supply',
            'description', 'image_url', 'external_url', 'attributes',
            'price_usd', 'market_cap', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class WalletBalanceSerializer(serializers.ModelSerializer):
    """Serializer for wallet balances."""
    wallet_address = serializers.CharField(source='wallet.address', read_only=True)
    token_name = serializers.CharField(source='token.name', read_only=True)
    token_symbol = serializers.CharField(source='token.symbol', read_only=True)
    token_image = serializers.URLField(source='token.image_url', read_only=True)
    
    class Meta:
        model = WalletBalance
        fields = [
            'id', 'wallet', 'wallet_address', 'token', 'token_name',
            'token_symbol', 'token_image', 'balance', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']


class DeFiProtocolSerializer(serializers.ModelSerializer):
    """Serializer for DeFi protocols."""
    supported_tokens_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DeFiProtocol
        fields = [
            'id', 'name', 'protocol_type', 'contract_address',
            'website', 'documentation', 'is_active', 'supported_tokens',
            'supported_tokens_count', 'apy', 'description', 'risk_level',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_supported_tokens_count(self, obj):
        """Get count of supported tokens."""
        return obj.supported_tokens.count()


class WalletVerificationSerializer(serializers.Serializer):
    """Serializer for wallet verification."""
    address = serializers.CharField(max_length=42)
    signature = serializers.CharField()
    message = serializers.CharField()
    
    def validate_address(self, value):
        """Validate Ethereum address format."""
        if not value.startswith('0x') or len(value) != 42:
            raise serializers.ValidationError('Invalid Ethereum address format.')
        return value.lower()


class TransactionRequestSerializer(serializers.Serializer):
    """Serializer for transaction requests."""
    to_address = serializers.CharField(max_length=42)
    value = serializers.DecimalField(max_digits=36, decimal_places=18)
    gas_limit = serializers.IntegerField(required=False)
    gas_price = serializers.IntegerField(required=False)
    data = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_to_address(self, value):
        """Validate Ethereum address format."""
        if not value.startswith('0x') or len(value) != 42:
            raise serializers.ValidationError('Invalid Ethereum address format.')
        return value.lower()
    
    def validate_value(self, value):
        """Validate transaction value."""
        if value < 0:
            raise serializers.ValidationError('Transaction value cannot be negative.')
        return value


class TokenTransferSerializer(serializers.Serializer):
    """Serializer for token transfers."""
    token_address = serializers.CharField(max_length=42)
    to_address = serializers.CharField(max_length=42)
    amount = serializers.DecimalField(max_digits=36, decimal_places=18)
    token_id = serializers.CharField(required=False, allow_blank=True)  # For NFTs
    
    def validate_token_address(self, value):
        """Validate Ethereum address format."""
        if not value.startswith('0x') or len(value) != 42:
            raise serializers.ValidationError('Invalid token address format.')
        return value.lower()
    
    def validate_to_address(self, value):
        """Validate Ethereum address format."""
        if not value.startswith('0x') or len(value) != 42:
            raise serializers.ValidationError('Invalid recipient address format.')
        return value.lower()
    
    def validate_amount(self, value):
        """Validate transfer amount."""
        if value <= 0:
            raise serializers.ValidationError('Transfer amount must be positive.')
        return value


class MessageSigningSerializer(serializers.Serializer):
    """Serializer for message signing requests."""
    address = serializers.CharField(max_length=42)
    
    def validate_address(self, value):
        """Validate Ethereum address format."""
        if not value.startswith('0x') or len(value) != 42:
            raise serializers.ValidationError('Invalid Ethereum address format.')
        return value.lower()


class SignatureVerificationSerializer(serializers.Serializer):
    """Serializer for signature verification."""
    address = serializers.CharField(max_length=42)
    signature = serializers.CharField()
    message = serializers.CharField()
    
    def validate_address(self, value):
        """Validate Ethereum address format."""
        if not value.startswith('0x') or len(value) != 42:
            raise serializers.ValidationError('Invalid Ethereum address format.')
        return value.lower()
    
    def validate_signature(self, value):
        """Validate signature format."""
        if not value.startswith('0x') or len(value) != 132:
            raise serializers.ValidationError('Invalid signature format.')
        return value
