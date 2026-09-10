import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

export default function StatCard({
  title,
  value,
  icon,
  color,
}) {
  return (
    <Card
      sx={{
        background: color,
        color: "#fff",
        borderRadius: "22px",
        height: 170,
        transition: "0.35s",

        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow:
            "0px 20px 45px rgba(0,0,0,.25)",
        },
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
        >
          <Typography
            variant="h6"
            fontWeight={600}
          >
            {title}
          </Typography>

          {icon}
        </Box>

        <Typography
          variant="h2"
          fontWeight="bold"
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          sx={{ opacity: .8 }}
        >
        </Typography>

      </CardContent>
    </Card>
  );
}