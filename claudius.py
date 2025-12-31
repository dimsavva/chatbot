#!/usr/bin/env python3
"""
Claudius Maximus - Your AI Buddy for Code Assistance

A tool to consult with Claude running in a Docker container for help
with code issues, debugging, and general programming questions.
"""

import subprocess
import base64
import os
import json
import sys
from pathlib import Path
from typing import List, Optional


class ClaudiusMaximus:
    """
    A helper class to consult with Claude running in Docker.

    Usage:
        claudius = ClaudiusMaximus()
        response = claudius.consult(
            instruction="Help me fix this bug",
            files=["src/app.py", "src/utils.py"],
            images=["screenshot.png"]
        )
        print(response)
    """

    def __init__(
        self,
        container_name: str = "claude-code-minimax",
        user: str = "claude",
        timeout: int = 300
    ):
        """
        Initialize Claudius Maximus.

        Args:
            container_name: Name of the Docker container running Claude
            user: User to run the command as in the container
            timeout: Timeout in seconds for the command
        """
        self.container_name = container_name
        self.user = user
        self.timeout = timeout

    def read_file(self, filepath: str) -> Optional[str]:
        """
        Read the contents of a file.

        Args:
            filepath: Path to the file to read

        Returns:
            File contents as string, or None if file doesn't exist
        """
        try:
            path = Path(filepath)
            if not path.exists():
                print(f"Warning: File not found: {filepath}")
                return None

            with open(path, 'r', encoding='utf-8', errors='replace') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading file {filepath}: {e}")
            return None

    def image_to_base64(self, image_path: str) -> Optional[str]:
        """
        Convert an image file to a base64 string.

        Args:
            image_path: Path to the image file

        Returns:
            Base64 encoded string of the image, or None if file doesn't exist
        """
        try:
            path = Path(image_path)
            if not path.exists():
                print(f"Warning: Image not found: {image_path}")
                return None

            with open(path, 'rb') as f:
                image_data = f.read()

            # Get the image extension for mime type
            ext = path.suffix.lower()
            mime_types = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.bmp': 'image/bmp'
            }
            mime_type = mime_types.get(ext, 'image/png')

            # Encode to base64
            b64_string = base64.b64encode(image_data).decode('utf-8')

            return f"data:{mime_type};base64,{b64_string}"

        except Exception as e:
            print(f"Error converting image {image_path}: {e}")
            return None

    def build_prompt(
        self,
        instruction: str,
        files: Optional[List[str]] = None,
        images: Optional[List[str]] = None
    ) -> str:
        """
        Build a complete prompt including file contents and images.

        Args:
            instruction: The main instruction or question
            files: List of file paths to include
            images: List of image paths to include

        Returns:
            Complete prompt string
        """
        prompt_parts = []

        # Add the main instruction
        prompt_parts.append(f"## Instruction\n{instruction}")

        # Add file contents
        if files:
            prompt_parts.append("\n## Relevant Files")
            for filepath in files:
                content = self.read_file(filepath)
                if content is not None:
                    # Get relative or absolute path for display
                    display_path = filepath
                    prompt_parts.append(f"\n### File: {display_path}\n```\n{content}\n```")

        # Add images as base64
        if images:
            prompt_parts.append("\n## Images (Base64)")
            for i, image_path in enumerate(images, 1):
                b64_data = self.image_to_base64(image_path)
                if b64_data is not None:
                    # Truncate for display but include full data
                    prompt_parts.append(f"\n### Image {i}: {image_path}")
                    prompt_parts.append(f"[BASE64_IMAGE: {b64_data[:100]}...]")
                    # Store full base64 for actual transmission
                    prompt_parts.append(f"\n<image>{b64_data}</image>")

        return "\n".join(prompt_parts)

    def execute_command(self, prompt: str) -> str:
        """
        Execute the docker command to consult with Claude.

        Args:
            prompt: The complete prompt to send

        Returns:
            Response from Claude
        """
        # Escape the prompt for shell
        # Using JSON encoding to safely escape special characters
        escaped_prompt = json.dumps(prompt)

        # Build the docker command
        cmd = [
            "docker", "exec", "-i",
            "-u", self.user,
            self.container_name,
            "claude", "-p", prompt,
            "--dangerously-skip-permissions"
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout
            )

            if result.returncode != 0:
                error_msg = result.stderr or "Unknown error"
                return f"Error from Claudius: {error_msg}"

            return result.stdout.strip()

        except subprocess.TimeoutExpired:
            return "Error: Command timed out"
        except Exception as e:
            return f"Error executing command: {e}"

    def consult(
        self,
        instruction: str,
        files: Optional[List[str]] = None,
        images: Optional[List[str]] = None
    ) -> str:
        """
        Consult with Claudius Maximus for help.

        This is the main method to use for getting assistance.

        Args:
            instruction: Your question or the issue you need help with
            files: List of relevant file paths to include for context
            images: List of image paths (screenshots, diagrams) to include

        Returns:
            Response from Claudius Maximus

        Example:
            claudius = ClaudiusMaximus()
            response = claudius.consult(
                instruction="Why is this React component not rendering?",
                files=["src/components/Button.tsx"],
                images=["error-screenshot.png"]
            )
        """
        # Build the complete prompt
        prompt = self.build_prompt(instruction, files, images)

        # Show what we're sending (truncated)
        print("=" * 60)
        print("[*] Consulting Claudius Maximus...")
        print("=" * 60)
        if len(prompt) > 500:
            print(f"Prompt preview:\n{prompt[:500]}...\n[truncated]")
        else:
            print(f"Prompt:\n{prompt}")
        print("=" * 60)

        # Execute and get response
        response = self.execute_command(prompt)

        print("\n[>] Response from Claudius Maximus:")
        print("-" * 60)
        print(response)
        print("-" * 60)

        return response

    def quick_ask(self, question: str) -> str:
        """
        Quick method to ask a simple question without files or images.

        Args:
            question: Your question

        Returns:
            Response from Claudius
        """
        return self.consult(instruction=question)

    def debug_file(self, filepath: str, issue: str) -> str:
        """
        Quick method to debug a specific file.

        Args:
            filepath: Path to the file with the issue
            issue: Description of the issue

        Returns:
            Response from Claudius
        """
        instruction = f"Please help me debug this issue: {issue}"
        return self.consult(instruction=instruction, files=[filepath])

    def review_code(self, files: List[str], focus: str = "general") -> str:
        """
        Request a code review for specified files.

        Args:
            files: List of files to review
            focus: What to focus on (e.g., "performance", "security", "style")

        Returns:
            Code review from Claudius
        """
        instruction = f"Please review the following code with a focus on: {focus}. Provide constructive feedback and suggestions for improvement."
        return self.consult(instruction=instruction, files=files)


# Convenience function for quick usage
def ask_claudius(
    instruction: str,
    files: Optional[List[str]] = None,
    images: Optional[List[str]] = None
) -> str:
    """
    Convenience function to quickly consult Claudius Maximus.

    Args:
        instruction: Your question or issue
        files: Optional list of file paths
        images: Optional list of image paths

    Returns:
        Response from Claudius
    """
    claudius = ClaudiusMaximus()
    return claudius.consult(instruction, files, images)


# CLI interface
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Consult with Claudius Maximus for code assistance",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Simple question
  python claudius.py -i "How do I center a div in CSS?"

  # Include files for context
  python claudius.py -i "Why is this not working?" -f src/app.py src/utils.py

  # Include screenshots
  python claudius.py -i "What's wrong with this UI?" -f src/component.tsx -img screenshot.png
        """
    )

    parser.add_argument(
        "-i", "--instruction",
        required=True,
        help="Your question or instruction"
    )

    parser.add_argument(
        "-f", "--files",
        nargs="*",
        default=[],
        help="File paths to include for context"
    )

    parser.add_argument(
        "-img", "--images",
        nargs="*",
        default=[],
        help="Image paths to include (will be converted to base64)"
    )

    parser.add_argument(
        "--container",
        default="claude-code-minimax",
        help="Docker container name (default: claude-code-minimax)"
    )

    parser.add_argument(
        "--user",
        default="claude",
        help="User in the container (default: claude)"
    )

    parser.add_argument(
        "--timeout",
        type=int,
        default=300,
        help="Timeout in seconds (default: 300)"
    )

    args = parser.parse_args()

    # Create instance and consult
    claudius = ClaudiusMaximus(
        container_name=args.container,
        user=args.user,
        timeout=args.timeout
    )

    response = claudius.consult(
        instruction=args.instruction,
        files=args.files if args.files else None,
        images=args.images if args.images else None
    )

    # Exit with appropriate code
    sys.exit(0 if response and not response.startswith("Error") else 1)
