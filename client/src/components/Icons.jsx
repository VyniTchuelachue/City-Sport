function Icon({ children, className = 'size-5', ...rest }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Icon>
);

export const MenuIcon = (props) => (
  <Icon {...props}>
    <path d="M3.5 8h17M3.5 16h17" />
  </Icon>
);

export const CloseIcon = (props) => (
  <Icon {...props}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Icon>
);

export const PhoneIcon = (props) => (
  <Icon {...props}>
    <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.500 5.700a2 2 0 0 1 2-2.200Z" />
  </Icon>
);

export const PinIcon = (props) => (
  <Icon {...props}>
    <path d="M12 21s6.500-5.700 6.500-11a6.500 6.500 0 0 0-13 0c0 5.300 6.500 11 6.500 11Z" />
    <circle cx="12" cy="10" r="2.300" />
  </Icon>
);

export const MailIcon = (props) => (
  <Icon {...props}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.500" />
    <path d="m4 7 8 6 8-6" />
  </Icon>
);

export const MinusIcon = (props) => (
  <Icon {...props}>
    <path d="M6 12h12" />
  </Icon>
);

export const PlusIcon = (props) => (
  <Icon {...props}>
    <path d="M12 6v12M6 12h12" />
  </Icon>
);

export const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="m5 12.500 4.500 4.500L19 7.500" />
  </Icon>
);

export const ArrowRightIcon = (props) => (
  <Icon {...props}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </Icon>
);

export const CartIcon = (props) => (
  <Icon {...props}>
    <path d="M3 4.5h2.2l2.3 10.200h9.800l1.900-7.200H6.400" />
    <circle cx="9" cy="19" r="1.400" />
    <circle cx="16.200" cy="19" r="1.400" />
  </Icon>
);

export const YoutubeIcon = (props) => (
  <Icon {...props}>
    <rect x="2.500" y="6" width="19" height="12" rx="3.500" />
    <path d="m10.200 9.300 4.800 2.700-4.800 2.700Z" fill="currentColor" stroke="none" />
  </Icon>
);
