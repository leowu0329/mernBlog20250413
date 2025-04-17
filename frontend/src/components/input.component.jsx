import { useState } from 'react';
const InputBox = ({ name, type, id, value, placeholder, icon }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <div className="relative w-[100%] mb-4">
      <input
        name={name}
        type={
          type === 'password' ? (passwordVisible ? 'text' : 'password') : type
        }
        placeholder={placeholder}
        defaultValue={value}
        id={id}
        className="w-[100%] bg-grey p-4 pl-12 rounded-lg outline-none focus:bg-transparent placeholder:text-dark-grey"
      />
      <i className={`fi ${icon} input-icon`}></i>
      {type === 'password' ? (
        <i
          className={
            'fi fi-rr-eye' +
            (!passwordVisible ? '-crossed' : '') +
            ' input-icon left-[auto] right-4 cursor-pointer'
          }
          onClick={() => setPasswordVisible((currentVal) => !currentVal)}
        ></i>
      ) : null}
    </div>
  );
};

export default InputBox;
