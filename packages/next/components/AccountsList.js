import React, { useRef, useState, useContext } from 'react';
import TakeoffContext from './contexts/TakeoffContext';

const AccountsList = () => {
  const { project, addAccount, removeAccount } = useContext(TakeoffContext);

  const accounts = project.accounts || [];
  console.log('accounts', accounts);

  const _input = useRef(null)
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleAddAccount = () => {
    setShowInput(true);
    setTimeout(() => _input.current?.focus(), 0);
  };

  const handleSubmit = () => {
    if (!inputValue) return;
    addAccount(inputValue);
    setInputValue('');
    setShowInput(false);
  };

  const handleCancel = () => {
    setInputValue('');
    setShowInput(false);
  };

  const handleEditAccount = (index, newValue) => {
    const updatedAccounts = accounts.map((account, i) => {
      if (i === index) {
        return { ...account, name: newValue };
      }
      return account;
    });
  };

  const handleRemoveAccount = (account) => {
    removeAccount(account);
  };

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold mb-2">Accounts</h2>
      <ul className="space-y-1">
        {accounts.map((account, index) => (
          <li key={index}>
            <span className="ml-2">{account.name}</span>
            <button onClick={() => handleRemoveAccount(account.name)} className="ml-2">
              x
            </button>
          </li>
        ))}
      </ul>
      {showInput ? (
        <div>
          <input
            ref={_input}
            value={inputValue}
            className="border border-gray-300 bg-gray-100 p-1 w-full"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button onClick={handleSubmit}>+</button>
          <button onClick={handleCancel}>x</button>
        </div>
      ) : (
        <button onClick={handleAddAccount}>Add Account</button>
      )}
    </div>
  );
};

export default AccountsList;
