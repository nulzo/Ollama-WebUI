# Define the directories to exclude
$excludeDirs = @('node_modules', '.venv', '.idea', 'frontend/node_modules', 'frontend/.venv', 'frontend/.idea', '.venv', '.git', '__pycache__', '.ruff_cache')

# Define a function to print the tree
function Print-Tree {
    param (
        [string]$Path,
        [string]$Prefix = ""
    )

    # Get the items in the current directory
    $items = Get-ChildItem -Path $Path -Force

    # Filter items to exclude specified directories
    $filteredItems = $items | Where-Object {
        $_.PSIsContainer -and -not ($excludeDirs -contains $_.Name) -or !($_.PSIsContainer)
    }

    for ($i = 0; $i -lt $filteredItems.Count; $i++) {
        $item = $filteredItems[$i]
        $isLastItem = $i -eq $filteredItems.Count - 1

        # Determine the prefix for the current item
        if ($isLastItem) {
            $currentPrefix = "$Prefix└──"
            $childPrefix = "$Prefix    "
        } else {
            $currentPrefix = "$Prefix├──"
            $childPrefix = "$Prefix│   "
        }

        # Print the current file or directory
        Write-Host "$currentPrefix $($item.Name)";

        # Recurse into directories
        if ($item.PSIsContainer -and -not ($excludeDirs -contains $item.Name)) {
            Print-Tree -Path $item.FullName -Prefix $childPrefix
        }
    }
}

# Start printing from the current directory
Print-Tree -Path (Get-Location).Path