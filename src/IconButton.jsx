import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import PropTypes from "prop-types";

export default function IconButton({
  icon,
  tooltip,
  variant = "ghost",
  size = "md",
  onClick,
  disabled = false
}) {
  const sizeClasses = {
    sm: "icon-btn-sm",
    md: "icon-btn-md",
    lg: "icon-btn-lg"
  };

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltip}</Tooltip>}
      delay={{ show: 300, hide: 150 }}
    >
      <span className="d-inline-block">
        <Button
          variant={variant}
          className={`ctmBtn icon-btn ${sizeClasses[size]}`}
          onClick={onClick}
          disabled={disabled}
        >
          <i className={icon}></i>
        </Button>
      </span>
    </OverlayTrigger>
  );
}

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  tooltip: PropTypes.string.isRequired,
  variant: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};
