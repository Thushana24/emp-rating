import React, { forwardRef, ComponentProps } from "react";
import { cn } from "@/utilities/cn";

// Main Card Container (like Table)
interface ICard extends ComponentProps<"div"> {
  wrapperClass?: string;
}

const Card = forwardRef<HTMLDivElement, ICard>(
  ({ children, className, wrapperClass, ...rest }, ref) => {
    return (
      <div
        className={cn(
          "scrollbar relative h-full w-full overflow-auto",
          wrapperClass,
        )}
      >
        <div
          ref={ref}
          className={cn(
            "grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-3",
            className,
          )}
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  },
);

// Card Item (individual card)
interface ICardItem extends ComponentProps<"div"> {
  variant?: "default" | "supervisor" | "employee" | "outlined";
}

const CardItem = forwardRef<HTMLDivElement, ICardItem>(
  ({ children, className, variant = "default", ...rest }, ref) => {
    const variantClasses = {
      default: "bg-white border-gray-200",
      supervisor:
        "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 border-l-4 border-l-indigo-500",
      employee: "bg-white border-gray-200 hover:border-indigo-300",
      outlined: "bg-white border-gray-300",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border p-5 shadow-sm transition-all hover:shadow-md",
          variantClasses[variant],
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

// Card Header
interface ICardHeader extends ComponentProps<"div"> {}

const CardHeader = forwardRef<HTMLDivElement, ICardHeader>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mb-4 flex items-center justify-between gap-4",
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

// Card Title
interface ICardTitle extends ComponentProps<"h3"> {}

const CardTitle = forwardRef<HTMLHeadingElement, ICardTitle>(
  ({ children, className, ...rest }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-lg font-semibold text-gray-800", className)}
        {...rest}
      >
        {children}
      </h3>
    );
  },
);

// Card Subtitle
interface ICardSubtitle extends ComponentProps<"p"> {}

const CardSubtitle = forwardRef<HTMLParagraphElement, ICardSubtitle>(
  ({ children, className, ...rest }, ref) => {
    return (
      <p ref={ref} className={cn("text-sm text-gray-600", className)} {...rest}>
        {children}
      </p>
    );
  },
);

// Card Body
interface ICardBody extends ComponentProps<"div"> {}

const CardBody = forwardRef<HTMLDivElement, ICardBody>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-3", className)} {...rest}>
        {children}
      </div>
    );
  },
);

// Card Row (for key-value pairs)
interface ICardRow extends ComponentProps<"div"> {}

const CardRow = forwardRef<HTMLDivElement, ICardRow>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between py-1.5", className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

// Card Label
interface ICardLabel extends ComponentProps<"span"> {}

const CardLabel = forwardRef<HTMLSpanElement, ICardLabel>(
  ({ children, className, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("text-sm font-medium text-gray-600", className)}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

// Card Value
interface ICardValue extends ComponentProps<"span"> {}

const CardValue = forwardRef<HTMLSpanElement, ICardValue>(
  ({ children, className, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("text-sm font-medium text-gray-800", className)}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

// Card Footer
interface ICardFooter extends ComponentProps<"div"> {}

const CardFooter = forwardRef<HTMLDivElement, ICardFooter>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-4 border-t border-gray-200 pt-4", className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

// Card Badge
interface ICardBadge extends ComponentProps<"span"> {
  variant?: "default" | "success" | "warning" | "info" | "danger";
}

const CardBadge = forwardRef<HTMLSpanElement, ICardBadge>(
  ({ children, className, variant = "default", ...rest }, ref) => {
    const variantClasses = {
      default: "bg-gray-100 text-gray-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800",
      danger: "bg-red-100 text-red-800",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          variantClasses[variant],
          className,
        )}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

// Card Avatar
interface ICardAvatar extends ComponentProps<"div"> {
  src?: string;
  alt?: string;
  fallback?: string;
}

const CardAvatar = forwardRef<HTMLDivElement, ICardAvatar>(
  ({ src, alt, fallback, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white",
          className,
        )}
        {...rest}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          fallback
        )}
      </div>
    );
  },
);

// Card Section (for grouping content within a card)
interface ICardSection extends ComponentProps<"div"> {}

const CardSection = forwardRef<HTMLDivElement, ICardSection>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div ref={ref} className={cn("py-3", className)} {...rest}>
        {children}
      </div>
    );
  },
);

// Card Actions (for buttons/actions)
interface ICardActions extends ComponentProps<"div"> {}

const CardActions = forwardRef<HTMLDivElement, ICardActions>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

// Apply display names
Card.displayName = "Card";
CardItem.displayName = "CardItem";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardSubtitle.displayName = "CardSubtitle";
CardBody.displayName = "CardBody";
CardRow.displayName = "CardRow";
CardLabel.displayName = "CardLabel";
CardValue.displayName = "CardValue";
CardFooter.displayName = "CardFooter";
CardBadge.displayName = "CardBadge";
CardAvatar.displayName = "CardAvatar";
CardSection.displayName = "CardSection";
CardActions.displayName = "CardActions";

export default Object.assign(Card, {
  Item: CardItem,
  Header: CardHeader,
  Title: CardTitle,
  Subtitle: CardSubtitle,
  Body: CardBody,
  Row: CardRow,
  Label: CardLabel,
  Value: CardValue,
  Footer: CardFooter,
  Badge: CardBadge,
  Avatar: CardAvatar,
  Section: CardSection,
  Actions: CardActions,
});
