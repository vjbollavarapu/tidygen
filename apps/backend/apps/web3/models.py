"""
Web3 and blockchain integration models.
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel

User = get_user_model()


class Wallet(BaseModel):
    """User wallet for blockchain interactions."""
    WALLET_TYPES = [
        ('metamask', 'MetaMask'),
        ('walletconnect', 'WalletConnect'),
        ('coinbase', 'Coinbase Wallet'),
        ('trust', 'Trust Wallet'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallets')
    address = models.CharField(max_length=42, unique=True)  # Ethereum address
    wallet_type = models.CharField(max_length=20, choices=WALLET_TYPES)
    is_primary = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    verification_signature = models.TextField(blank=True)
    last_used = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Wallet'
        verbose_name_plural = 'Wallets'
        unique_together = ['user', 'address']
    
    def __str__(self):
        return f"{self.user.username} - {self.address[:10]}..."


class BlockchainTransaction(BaseModel):
    """Record of blockchain transactions."""
    TRANSACTION_TYPES = [
        ('payment', 'Payment'),
        ('contract_deploy', 'Contract Deployment'),
        ('contract_call', 'Contract Call'),
        ('token_transfer', 'Token Transfer'),
        ('nft_mint', 'NFT Mint'),
        ('nft_transfer', 'NFT Transfer'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blockchain_transactions')
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_hash = models.CharField(max_length=66, unique=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Transaction details
    from_address = models.CharField(max_length=42)
    to_address = models.CharField(max_length=42)
    value = models.DecimalField(max_digits=36, decimal_places=18, default=0)
    gas_used = models.BigIntegerField(null=True, blank=True)
    gas_price = models.BigIntegerField(null=True, blank=True)
    block_number = models.BigIntegerField(null=True, blank=True)
    block_hash = models.CharField(max_length=66, blank=True)
    
    # Additional data
    contract_address = models.CharField(max_length=42, blank=True)
    token_address = models.CharField(max_length=42, blank=True)
    token_symbol = models.CharField(max_length=20, blank=True)
    token_decimals = models.IntegerField(null=True, blank=True)
    
    # Metadata
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        verbose_name = 'Blockchain Transaction'
        verbose_name_plural = 'Blockchain Transactions'
        ordering = ['-created']
        indexes = [
            models.Index(fields=['transaction_hash']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['wallet', 'transaction_type']),
        ]
    
    def __str__(self):
        return f"{self.transaction_type} - {self.transaction_hash[:10]}..."


class SmartContract(BaseModel):
    """Smart contracts deployed by the platform."""
    CONTRACT_TYPES = [
        ('erc20', 'ERC-20 Token'),
        ('erc721', 'ERC-721 NFT'),
        ('erc1155', 'ERC-1155 Multi-Token'),
        ('custom', 'Custom Contract'),
    ]
    
    name = models.CharField(max_length=100)
    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPES)
    address = models.CharField(max_length=42, unique=True)
    abi = models.JSONField()
    bytecode = models.TextField(blank=True)
    source_code = models.TextField(blank=True)
    
    # Deployment details
    deployer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deployed_contracts')
    deployment_transaction = models.ForeignKey(
        BlockchainTransaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deployed_contract'
    )
    deployment_block = models.BigIntegerField(null=True, blank=True)
    
    # Contract state
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    total_supply = models.DecimalField(max_digits=36, decimal_places=18, null=True, blank=True)
    
    # Metadata
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    documentation = models.URLField(blank=True)
    
    class Meta:
        verbose_name = 'Smart Contract'
        verbose_name_plural = 'Smart Contracts'
        ordering = ['-created']
    
    def __str__(self):
        return f"{self.name} ({self.address[:10]}...)"


class Token(BaseModel):
    """Tokens managed by the platform."""
    TOKEN_TYPES = [
        ('native', 'Native Token (ETH)'),
        ('erc20', 'ERC-20 Token'),
        ('erc721', 'ERC-721 NFT'),
        ('erc1155', 'ERC-1155 Token'),
    ]
    
    contract = models.ForeignKey(SmartContract, on_delete=models.CASCADE, related_name='tokens')
    token_id = models.CharField(max_length=100, blank=True)  # For NFTs
    symbol = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    decimals = models.IntegerField(default=18)
    total_supply = models.DecimalField(max_digits=36, decimal_places=18, null=True, blank=True)
    
    # Token metadata
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    external_url = models.URLField(blank=True)
    attributes = models.JSONField(default=dict, blank=True)
    
    # Pricing (if available)
    price_usd = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    market_cap = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    
    class Meta:
        verbose_name = 'Token'
        verbose_name_plural = 'Tokens'
        unique_together = ['contract', 'token_id']
        ordering = ['symbol', 'name']
    
    def __str__(self):
        if self.token_id:
            return f"{self.name} #{self.token_id}"
        return f"{self.name} ({self.symbol})"


class WalletBalance(BaseModel):
    """Wallet token balances."""
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='balances')
    token = models.ForeignKey(Token, on_delete=models.CASCADE, related_name='balances')
    balance = models.DecimalField(max_digits=36, decimal_places=18, default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Wallet Balance'
        verbose_name_plural = 'Wallet Balances'
        unique_together = ['wallet', 'token']
        ordering = ['-balance']
    
    def __str__(self):
        return f"{self.wallet.address[:10]}... - {self.balance} {self.token.symbol}"


class DeFiProtocol(BaseModel):
    """DeFi protocols integration."""
    PROTOCOL_TYPES = [
        ('dex', 'Decentralized Exchange'),
        ('lending', 'Lending Protocol'),
        ('yield', 'Yield Farming'),
        ('staking', 'Staking'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    protocol_type = models.CharField(max_length=20, choices=PROTOCOL_TYPES)
    contract_address = models.CharField(max_length=42)
    website = models.URLField(blank=True)
    documentation = models.URLField(blank=True)
    
    # Integration details
    is_active = models.BooleanField(default=True)
    supported_tokens = models.ManyToManyField(Token, blank=True)
    apy = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    
    # Metadata
    description = models.TextField(blank=True)
    risk_level = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ],
        default='medium'
    )
    
    class Meta:
        verbose_name = 'DeFi Protocol'
        verbose_name_plural = 'DeFi Protocols'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.protocol_type})"
