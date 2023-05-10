import { makeStyles } from "@material-ui/core/styles";

export const buttonStyles = makeStyles((theme) => ({
  button: {
    backgroundColor: "green",
    borderRadius: "8px",
    color: "white",
    height: "44px",
    "&:hover": {
      backgroundColor: "#e6e5e5",
    },
    width: "90%",
    justifyContent: "start",
    paddingLeft: "24px",
  },
  text: {
    fontSize: "0.875rem",
    fontWeight: "500",
    lineHeight: "18px",
  },
  icon: {
    fontSize: "1rem",
  },
}));
