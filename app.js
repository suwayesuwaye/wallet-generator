function showMessage(message, type = 'processing') {
    const loadingText = document.getElementById('loadingText');
    loadingText.textContent = message;
    
    // Remove all possible classes first
    loadingText.classList.remove('success', 'processing', 'error');
    
    // Add the appropriate class
    loadingText.classList.add('active', type);
    
    if (type === 'success') {
        setTimeout(() => {
            loadingText.classList.remove('active');
        }, 3000);
    }
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
        return;
    }
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function generateEVMWallets(amount) {
    let csv = "address,private_key,mnemonic\n";
    showMessage('Please wait while generating EVM wallets...', 'processing');
    
    for (let i = 0; i < amount; i++) {
        try {
            const wallet = ethers.Wallet.createRandom();
            csv += `${wallet.address},${wallet.privateKey},${wallet.mnemonic.phrase}\n`;
            
            // Update progress every wallet or more frequently for small amounts
            const percentage = Math.round(((i + 1) / amount) * 100);
            showMessage(`Generating EVM wallets: ${percentage}% complete...`, 'processing');
            
            // Add a small delay every 10 wallets to allow UI updates
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        } catch (error) {
            console.error('Error generating EVM wallet:', error);
            throw error;
        }
    }
    
    downloadCSV(csv, 'evm_wallets.csv');
    showMessage('EVM wallets generated successfully! Download started.', 'success');
}

async function generateAptosWallets(amount) {
    let csv = "address,private_key\n";
    showMessage('Please wait while generating Aptos wallets...', 'processing');
    
    for (let i = 0; i < amount; i++) {
        try {
            // Generate random bytes for private key
            const privateKeyBytes = new Uint8Array(32);
            crypto.getRandomValues(privateKeyBytes);
            
            // Convert to hex string
            const privateKeyHex = Array.from(privateKeyBytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            // Generate address from private key
            const address = `0x${privateKeyHex.slice(0, 40)}`; // Simple address derivation
            
            csv += `${address},${privateKeyHex}\n`;
            
            // Update progress for each wallet
            const percentage = Math.round(((i + 1) / amount) * 100);
            showMessage(`Generating Aptos wallets: ${percentage}% complete...`, 'processing');
            
            // Add a small delay every 10 wallets to allow UI updates
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        } catch (error) {
            console.error('Error generating Aptos wallet:', error);
            throw error;
        }
    }
    
    downloadCSV(csv, 'aptos_wallets.csv');
    showMessage('Aptos wallets generated successfully! Download started.', 'success');
}

async function generateWallets(type) {
    const amount = parseInt(document.getElementById('amount').value);
    if (isNaN(amount) || amount < 1 || amount > 5000) {
        showMessage('Please enter a number between 1 and 5000', 'error');
        return;
    }

    const evmBtn = document.getElementById('evmBtn');
    const aptosBtn = document.getElementById('aptosBtn');

    // Disable buttons and show loading
    evmBtn.disabled = true;
    aptosBtn.disabled = true;

    showMessage(`Preparing to generate ${amount} ${type.toUpperCase()} wallets...`, 'processing');

    try {
        if (type === 'evm') {
            await generateEVMWallets(amount);
            showMessage(`Successfully generated ${amount} EVM wallets!`, 'success');
        } else if (type === 'aptos') {
            await generateAptosWallets(amount);
            showMessage(`Successfully generated ${amount} Aptos wallets!`, 'success');
        }
    } catch (error) {
        console.error('Error generating wallets:', error);
        showMessage('Error generating wallets. Check console for details.', 'error');
    } finally {
        // Re-enable buttons
        evmBtn.disabled = false;
        aptosBtn.disabled = false;
    }
}
